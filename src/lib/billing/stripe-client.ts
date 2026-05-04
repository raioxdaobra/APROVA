/**
 * Helper client-safe para detectar se o Stripe está habilitado.
 * Lê apenas a publishable key (NEXT_PUBLIC_*) — secret key fica no server.
 */
export function isStripeEnabledClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}
