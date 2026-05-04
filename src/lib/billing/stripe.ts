/**
 * Stripe client lazy-init. Retorna `null` quando `STRIPE_SECRET_KEY` não está
 * configurada — chamadores devem tratar esse caso com fallback "Em breve".
 */
import Stripe from 'stripe';

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  // Sem apiVersion explícito → usa a default da SDK instalada.
  cached = new Stripe(key);
  return cached;
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getPriceId(plan: 'monthly' | 'annual'): string | null {
  if (plan === 'monthly') return process.env.STRIPE_PRICE_MONTHLY ?? null;
  return process.env.STRIPE_PRICE_ANNUAL ?? null;
}

export function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    'http://localhost:3000'
  ).replace(/^(?!https?:\/\/)/, 'https://');
}
