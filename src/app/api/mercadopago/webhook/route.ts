/**
 * POST /api/mercadopago/webhook
 *
 * Stub do webhook de notificações do Mercado Pago. PR 28 cria o endpoint
 * apenas para que o MP não receba 404 ao notificar pagamentos. A ativação
 * real de `profiles.plan='pro'` + persistência em `payments` virá no PR 31
 * (assinatura recorrente).
 *
 * Por ora apenas loga payload truncado e responde 200 — comportamento
 * recomendado pela MP quando o webhook ainda não processa eventos.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }
  try {
    const trimmed = JSON.stringify(payload).slice(0, 500);
    console.log('[mercadopago.webhook] received', trimmed);
  } catch {
    console.log('[mercadopago.webhook] received (unserializable payload)');
  }
  return NextResponse.json({ received: true });
}

export async function GET() {
  // MP costuma fazer GET de verificação/health.
  return NextResponse.json({ ok: true });
}
