/**
 * POST /api/stripe/checkout
 *
 * Cria uma Stripe Checkout Session (mode=subscription) para o plano
 * selecionado (monthly | annual) e retorna a URL de redirecionamento.
 *
 * Quando `STRIPE_SECRET_KEY` ou as price IDs não estão configuradas,
 * retorna 503 com `error: stripe_not_configured` — o paywall modal trata
 * o caso exibindo a mensagem de fallback.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  getAppUrl,
  getPriceId,
  getStripe,
  isStripeEnabled,
} from '@/lib/billing/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

export async function POST(request: Request) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: 'stripe_not_configured' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = (await request.json()) as unknown;
    const r = bodySchema.safeParse(body);
    if (!r.success) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    parsed = r.data;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const priceId = getPriceId(parsed.plan);
  if (!priceId) {
    return NextResponse.json(
      { error: 'price_not_configured' },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'stripe_not_configured' },
      { status: 503 },
    );
  }

  // Reutiliza customer_id se já existe (1:1 com profile).
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const appUrl = getAppUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // Stripe Checkout para subscriptions detecta automaticamente os métodos
      // habilitados na conta (card + PIX no Brasil). Não fixar payment_method_types
      // permite PIX quando habilitado no dashboard Stripe.
      line_items: [{ price: priceId, quantity: 1 }],
      ...(sub?.stripe_customer_id
        ? { customer: sub.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan: parsed.plan },
      subscription_data: {
        metadata: { user_id: user.id, plan: parsed.plan },
      },
      success_url: `${appUrl}/billing/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancelado`,
      locale: 'pt-BR',
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'no_session_url' },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'checkout_failed',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }
}
