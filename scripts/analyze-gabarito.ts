/**
 * scripts/analyze-gabarito.ts
 *
 * Analisa a distribuicao do gabarito das questoes Unifor (nao-anuladas):
 *  - Frequencia geral A/B/C/D/E
 *  - Por disciplina
 *  - Por ano
 *  - Posicao da questao (numero baixo vs alto)
 *
 * Uso: tsx scripts/analyze-gabarito.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

type EnvMap = Record<string, string>;

function loadEnvLocal(): EnvMap {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return {};
  const content = readFileSync(path, 'utf8');
  const map: EnvMap = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  return map;
}

interface Row {
  id: string;
  discipline: string;
  year: number;
  semester: number;
  question_num: number;
  correct_answer: string;
  annulled: boolean | null;
}

async function main() {
  const env = { ...loadEnvLocal(), ...(process.env as EnvMap) };
  const url = env['NEXT_PUBLIC_SUPABASE_URL'];
  const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  if (!url || !key) {
    console.error('Faltam envs');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pagina pra pegar todas
  const all: Row[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, discipline, year, semester, question_num, correct_answer, annulled')
      .eq('annulled', false)
      .range(from, from + PAGE - 1);
    if (error) {
      console.error('erro:', error.message);
      process.exit(2);
    }
    if (!data || data.length === 0) break;
    all.push(...(data as Row[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`\nTotal de questoes (nao-anuladas): ${all.length}\n`);

  // Geral
  const geral: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const r of all) {
    if (r.correct_answer in geral) geral[r.correct_answer]!++;
  }
  console.log('=== Distribuicao geral do gabarito ===');
  printDist(geral, all.length);

  // Por disciplina
  console.log('\n=== Por disciplina ===');
  const byDisc: Record<string, Record<string, number>> = {};
  for (const r of all) {
    if (!byDisc[r.discipline]) byDisc[r.discipline] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    if (r.correct_answer in byDisc[r.discipline]!) byDisc[r.discipline]![r.correct_answer]!++;
  }
  for (const [d, dist] of Object.entries(byDisc)) {
    const total = Object.values(dist).reduce((s, n) => s + n, 0);
    console.log(`\n${d} (n=${total}):`);
    printDist(dist, total);
  }

  // Por ano
  console.log('\n=== Por ano ===');
  const byYear: Record<number, Record<string, number>> = {};
  for (const r of all) {
    if (!byYear[r.year]) byYear[r.year] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    if (r.correct_answer in byYear[r.year]!) byYear[r.year]![r.correct_answer]!++;
  }
  for (const y of Object.keys(byYear).sort()) {
    const dist = byYear[Number(y)]!;
    const total = Object.values(dist).reduce((s, n) => s + n, 0);
    console.log(`\n${y} (n=${total}):`);
    printDist(dist, total);
  }

  // Por posicao (terco da prova: 1-20, 21-40, 41-60)
  console.log('\n=== Por posicao na prova ===');
  const buckets = {
    inicio: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    meio: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    fim: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  };
  for (const r of all) {
    let b: keyof typeof buckets = 'inicio';
    if (r.question_num > 40) b = 'fim';
    else if (r.question_num > 20) b = 'meio';
    if (r.correct_answer in buckets[b]) buckets[b][r.correct_answer as 'A']!++;
  }
  for (const [name, dist] of Object.entries(buckets)) {
    const total = Object.values(dist).reduce((s, n) => s + n, 0);
    console.log(`\n${name} (questoes 1-20/21-40/41-60), n=${total}:`);
    printDist(dist, total);
  }
}

function printDist(d: Record<string, number>, total: number) {
  if (total === 0) {
    console.log('  (vazio)');
    return;
  }
  const letters = ['A', 'B', 'C', 'D', 'E'];
  for (const l of letters) {
    const n = d[l] ?? 0;
    const pct = ((n / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round((n / total) * 40));
    console.log(`  ${l}: ${n.toString().padStart(4)} (${pct.padStart(5)}%) ${bar}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(99);
});
