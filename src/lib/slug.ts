/**
 * Helpers de slug para URLs amigáveis.
 *
 * `slugify(value)` normaliza para a forma usada nas rotas de aprofundamento
 * (`/aprofundar/[discipline]/[subtopic-slug]`):
 *   - lowercase
 *   - remove acentos (NFKD + strip combining marks)
 *   - troca caracteres não-alfa-numéricos por hífen
 *   - colapsa hífens múltiplos e remove hífens nas pontas
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
