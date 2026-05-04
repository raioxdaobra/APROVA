/**
 * POST /api/stripe/webhook
 *
 * Recebe eventos do Stripe e sincroniza `subscriptions` + `profiles.plan` /
 * `profiles.plan_expires_at`. Valida signature com `STRIPE_WEBHOOK_SECRET`.
 *
 * Eventos tratados:
 *   - checkout.session.completed       → cria/ativa subscription, plan=pro
 *   - customer.subscription.updated    → atualiza status + período
 *   - customer.subscription.deleted    → status=canceled, plan=free
 *
 * Escrita usa Supabase service-role (bypass RLS).
 */
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  getStripe,
  getWebhookSecret,
  isStripeEnabled,
} from '@/lib/billing/stripe';
import type {
  Database,
  Plan,
  SubscriptionStatus,
} from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ServiceClient = ReturnType<typeof createSupabaseClient<Database>>;

function getServiceClient(): ServiceClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    case 'incomplete':
    case 'paused':
    default:
      return 'inactive';
  }
}

function deriveUserId(sub: Stripe.Subscription): string | null {
  const meta = sub.metadata?.user_id;
  if (typeof meta === 'string' && meta.length > 0) return meta;
  return null;
}

function periodEndIso(sub: Stripe.Subscription): string | null {
  // Em Stripe API ≥ 2025, current_period_end vive em items.data[0]; em versões
  // anteriores, era um campo top-level na subscription. Tentamos ambos.
  const subAny = sub as unknown as {
    current_period_end?: number | null;
    items?: { data?: Array<{ current_period_end?: number | null }> };
  };
  const fromTop = typeof subAny.current_period_end === 'number'
    ? subAny.current_period_end
    : null;
  const fromItem = subAny.items?.data?.[0]?.current_period_end ?? null;
  const ts = fromItem ?? fromTop;
  if (typeof ts !== 'number') return null;
  return new Date(ts * 1000).toISOString();
}

async function applySubscription(
  client: ServiceClient,
  userId: string,
  sub: Stripe.Subscription,
) {
  const status = mapStatus(sub.status);
  const periodEnd = periodEndIso(sub);
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const isActive = status === 'active' || status === 'past_due';
  const plan: Plan = isActive ? 'pro' : 'free';
  const planExpiresAt = isActive ? periodEnd : null;

  await client
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        status,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  await client
    .from('profiles')
    .update({
      plan,
      plan_expires_at: planExpiresAt,
    })
    .eq('id', userId);
}

async function handleCheckoutCompleted(
  client: ServiceClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId =
    session.metadata?.user_id ?? session.client_reference_id ?? null;
  if (!userId) return;
  if (!session.subscription) return;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id;

  // Busca a subscription completa para obter status + period_end.
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  // Garante que metadata.user_id está fixado na subscription.
  if (!sub.metadata?.user_id) {
    await stripe.subscriptions.update(subscriptionId, {
      metadata: { ...sub.metadata, user_id: userId },
    });
    sub.metadata = { ...sub.metadata, user_id: userId };
  }
  await applySubscription(client, userId, sub);
}

async function handleSubscriptionUpdated(
  client: ServiceClient,
  sub: Stripe.Subscription,
) {
  const userId = deriveUserId(sub);
  if (!userId) return;
  await applySubscription(client, userId, sub);
}

async function handleSubscriptionDeleted(
  client: ServiceClient,
  sub: Stripe.Subscription,
) {
  const userId = deriveUserId(sub);
  if (!userId) return;
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  await client
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        status: 'canceled',
        current_period_end: periodEndIso(sub),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  await client
    .from('profiles')
    .update({ plan: 'free', plan_expires_at: null })
    .eq('id', userId);
}

export async function POST(request: Request) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: 'stripe_not_configured' },
      { status: 503 },
    );
  }
  const stripe = getStripe();
  const secret = getWebhookSecret();
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: 'webhook_not_configured' },
      { status: 503 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'missing_signature' },
      { status: 400 },
    );
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'invalid_signature',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 400 },
    );
  }

  const client = getServiceClient();
  if (!client) {
    return NextResponse.json(
      { error: 'supabase_service_role_missing' },
      { status: 500 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          client,
          stripe,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await handleSubscriptionUpdated(
          client,
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          client,
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        // Outros eventos: ignorar mas confirmar 200 para o Stripe não retentar.
        break;
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: 'handler_failed',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
