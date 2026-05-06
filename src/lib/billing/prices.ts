/**
 * Preços APROVA Pro — fonte única de verdade.
 *
 * Usados em:
 *  - Paywall modal (display)
 *  - Endpoint Mercado Pago (criação de preferência)
 *  - Página /conta (CTA "Renovar / Assinar Pro")
 *
 * Mantido em BRL com 2 casas. Strings de exibição ficam centralizadas para
 * que mudanças de pricing sejam um diff único.
 */

export type PlanInterval = 'monthly' | 'annual';

export const PRICE_MONTHLY_BRL = 14.9;
export const PRICE_ANNUAL_BRL = 119;

export const PLAN_LABELS: Record<PlanInterval, string> = {
  monthly: 'APROVA Pro Mensal',
  annual: 'APROVA Pro Anual',
};

export function getPriceBRL(plan: PlanInterval): number {
  return plan === 'monthly' ? PRICE_MONTHLY_BRL : PRICE_ANNUAL_BRL;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}
