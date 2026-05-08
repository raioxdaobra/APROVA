/**
 * Helper pra contornar o hard cap de 1000 rows do Supabase/PostgREST.
 *
 * Mesmo com `.range(0, 9999)` ou `.limit(2000)`, o servidor enforca
 * `db-max-rows: 1000` (configuração do PostgREST). A solução é paginar
 * manualmente em chunks de 1000.
 *
 * O caller passa uma factory que recebe `{from, to}` e retorna a query
 * com `.range(from, to)` aplicado. Cada chamada cria builder fresh
 * (porque PostgrestFilterBuilder é one-shot).
 *
 * Uso:
 *   const rows = await fetchAll(({from, to}) =>
 *     supabase
 *       .from('questions')
 *       .select('discipline, subtopic, annulled')
 *       .eq('exam', 'unifor-medicina')
 *       .eq('annulled', false)
 *       .range(from, to));
 */

const PAGE_SIZE = 1000;
const MAX_PAGES = 20; // 20k rows, safety stop

type QueryResult<T> = { data: T[] | null; error: { message: string } | null };

export async function fetchAll<T>(
  makeQuery: (args: { from: number; to: number }) => PromiseLike<QueryResult<T>>,
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await makeQuery({ from, to });
    if (error) {
      console.error('[fetchAll] error on page', page, error.message);
      return all;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break; // última página
  }
  return all;
}
