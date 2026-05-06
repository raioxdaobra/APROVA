/**
 * POST /api/mercadopago/checkout
 *
 * Cria uma "preference" no Mercado Pago (modo Bricks / pagamento avulso)
 * para o plano selecionado e retorna a URL `init_point` para o cliente
 * redirecionar.
 *
 * PR 28: avulso (sem assinatura recorrente). PR 31 vai implementar
 * assinatura via /webhook + tabela payments + reativação do `plan='pro'`.
 *
 * Quando `MERCADOPAGO_ACCESS_TOKEN` não está configurado, retorna 503 com
 * `error: 'mp_not_configured'` — o paywall trata exibindo fallback.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAppUrl } from '@/lib/billing/stripe';
import { PLAN_LABELS, getPriceBRL, type PlanInterval } from '@/lib/billing/prices';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

const MP_PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences';

function isMpEnabled(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export async function POST(request: Request) {
  if (!isMpEnabled()) {
    return NextResponse.json({ error: 'mp_not_configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed: { plan: PlanInterval };
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

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
  const baseUrl = getAppUrl();
  const unitPrice = getPriceBRL(parsed.plan);
  const title = PLAN_LABELS[parsed.plan];

  const preferenceBody = {
    items: [
      {
        title,
        quantity: 1,
        unit_price: unitPrice,
        currency_id: 'BRL',
      },
    ],
    payer: {
      email: user.email ?? undefined,
    },
    back_urls: {
      success: `${baseUrl}/conta?mp=success`,
      failure: `${baseUrl}/conta?mp=failure`,
      pending: `${baseUrl}/conta?mp=pending`,
    },
    auto_return: 'approved',
    external_reference: `${user.id}|${parsed.plan}`,
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    statement_descriptor: 'APROVA',
    metadata: {
      user_id: user.id,
      plan: parsed.plan,
    },
  };

  try {
    const res = await fetch(MP_PREFERENCES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[mercadopago.checkout] preference failed', res.status, text.slice(0, 500));
      return NextResponse.json(
        { error: 'preference_failed', status: res.status },
        { status: 502 },
      );
    }

    const json = (await res.json().catch(() => ({}))) as {
      init_point?: string;
      sandbox_init_point?: string;
      id?: string;
    };

    const url = json.init_point ?? json.sandbox_init_point;
    if (!url) {
      return NextResponse.json({ error: 'no_init_point' }, { status: 502 });
    }

    return NextResponse.json({ url, preferenceId: json.id ?? null });
  } catch (err) {
    console.error('[mercadopago.checkout] fetch error', err);
    return NextResponse.json(
      {
        error: 'checkout_failed',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }
}
