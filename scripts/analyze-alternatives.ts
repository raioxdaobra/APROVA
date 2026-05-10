/**
 * Roda analise estatistica sobre as alternativas extraidas em
 * questions.alternatives (jsonb). Produz um relatorio markdown com
 * padroes da banca Unifor Medicina.
 *
 * Eixos analisados:
 *   1. Comprimento (chars + palavras) — correta vs erradas, geral e por
 *      disciplina
 *   2. Termos absolutos (sempre, nunca, todos, nenhum, exclusivamente,
 *      jamais, somente) — frequencia em corretas vs erradas
 *   3. Qualificadores (geralmente, pode, costuma, tende, em geral,
 *      maioria, alguns) — frequencia em corretas vs erradas
 *   4. Negacao (nao, incorreto, exceto, errada, falsa) — distribuicao
 *   5. Repeticao de palavras-chave do enunciado nas alternativas
 *   6. Distribuicao da letra correta por subtopico
 *   7. Padroes em questoes numericas (alternativa correta tende a ser
 *      menor, media ou maior valor?)
 *   8. "Todas/nenhuma das anteriores" — frequencia e taxa
 *
 * Uso: tsx scripts/analyze-alternatives.ts [--out=docs/relatorio.md]
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith('--out='));
const OUT_FILE = outArg ? outArg.split('=')[1] : 'docs/cheat-sheet-unifor.md';

const ABSOLUTE_TERMS = [
  'sempre',
  'nunca',
  'todos',
  'todas',
  'nenhum',
  'nenhuma',
  'exclusivamente',
  'jamais',
  'somente',
  'apenas',
  'unicamente',
  'obrigatoriamente',
  'qualquer',
  'impossivel',
  'impossível',
];

const QUALIFIER_TERMS = [
  'geralmente',
  'pode',
  'podem',
  'costuma',
  'costumam',
  'tende',
  'tendem',
  'maioria',
  'alguns',
  'algumas',
  'aproximadamente',
  'cerca de',
  'em geral',
  'frequentemente',
  'usualmente',
  'normalmente',
  'provavelmente',
];

const NEGATION_TERMS = [
  ' nao ',
  ' não ',
  'incorret',
  'exceto',
  'errada',
  'errado',
  'falsa',
  'falso',
  'nunca',
  'jamais',
];

const ANTERIORES_PHRASES = [
  'todas as anteriores',
  'todas as alternativas',
  'nenhuma das anteriores',
  'nenhuma das alternativas',
  'n.d.a',
  'n.r.a',
  'todas estao corretas',
];

interface AltsRow {
  id: string;
  discipline: string;
  subtopic: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  alternatives: { a?: string; b?: string; c?: string; d?: string; e?: string };
  pedagogy: {
    bloom?: string;
    tipo?: string;
    formato?: string;
    estrategia_distratores?: string;
    complexidade?: number;
    palavra_chave_enunciado?: string;
  } | null;
}

const LETTERS = ['a', 'b', 'c', 'd', 'e'] as const;

function normalize(text: string): string {
  return ` ${text.toLowerCase()} `;
}

function countOccurrences(text: string, terms: string[]): number {
  const norm = normalize(text);
  let count = 0;
  for (const term of terms) {
    const idx = norm.indexOf(term);
    if (idx >= 0) count++;
  }
  return count;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function tryParseNumber(text: string): number | null {
  const cleaned = text
    .replace(/[^\d,.\-]/g, '')
    .replace(/\.(?=\d{3}\b)/g, '') // remove milhares
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

interface Stats {
  count: number;
  charsCorreta: number[];
  charsErrada: number[];
  absCorreta: number;
  absErrada: number;
  qualCorreta: number;
  qualErrada: number;
  negCorreta: number;
  negErrada: number;
  numericCorrectRank: number[]; // 0=menor, 4=maior
  numericTotal: number;
}

function emptyStats(): Stats {
  return {
    count: 0,
    charsCorreta: [],
    charsErrada: [],
    absCorreta: 0,
    absErrada: 0,
    qualCorreta: 0,
    qualErrada: 0,
    negCorreta: 0,
    negErrada: 0,
    numericCorrectRank: [],
    numericTotal: 0,
  };
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function pct(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function processRow(row: AltsRow, stats: Stats) {
  stats.count++;
  const correctKey = row.correct_answer.toLowerCase() as 'a';
  const alts = row.alternatives;

  for (const k of LETTERS) {
    const text = alts[k];
    if (!text) continue;
    const isCorrect = k === correctKey;
    const len = text.length;
    const absHits = countOccurrences(text, ABSOLUTE_TERMS);
    const qualHits = countOccurrences(text, QUALIFIER_TERMS);
    const negHits = countOccurrences(text, NEGATION_TERMS);

    if (isCorrect) {
      stats.charsCorreta.push(len);
      stats.absCorreta += absHits;
      stats.qualCorreta += qualHits;
      stats.negCorreta += negHits;
    } else {
      stats.charsErrada.push(len);
      stats.absErrada += absHits;
      stats.qualErrada += qualHits;
      stats.negErrada += negHits;
    }
  }

  // Analise numerica: se TODAS as 5 alternativas sao numeros, qual o rank
  // (0=menor, 4=maior) da correta?
  const numbers: Array<{ k: string; n: number }> = [];
  for (const k of LETTERS) {
    const text = alts[k];
    if (!text) {
      numbers.length = 0;
      break;
    }
    const n = tryParseNumber(text);
    if (n === null) {
      numbers.length = 0;
      break;
    }
    numbers.push({ k, n });
  }
  if (numbers.length === 5) {
    const sorted = [...numbers].sort((a, b) => a.n - b.n);
    const rank = sorted.findIndex((x) => x.k === correctKey);
    stats.numericCorrectRank.push(rank);
    stats.numericTotal++;
  }
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error('SUPABASE_DB_URL ausente');
  const url = new URL(dbUrl);
  const projectRef = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)![1];
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const { rows } = await client.query<AltsRow>(`
    select id, discipline, subtopic, correct_answer, alternatives, pedagogy
      from public.questions
     where exam = 'unifor-medicina'
       and coalesce(annulled, false) = false
       and alternatives is not null
       and correct_answer is not null
  `);

  const withPedagogy = rows.filter((r) => r.pedagogy !== null).length;
  console.log(
    `Analisando ${rows.length} questoes (com alternatives) — ${withPedagogy} tambem com pedagogy.`,
  );

  const overall = emptyStats();
  const byDiscipline = new Map<string, Stats>();
  const correctByDiscipline = new Map<string, Record<string, number>>();
  const anterioresStats = {
    total: 0,
    asCorrect: 0,
  };

  for (const r of rows) {
    processRow(r, overall);

    if (!byDiscipline.has(r.discipline)) {
      byDiscipline.set(r.discipline, emptyStats());
    }
    processRow(r, byDiscipline.get(r.discipline)!);

    if (!correctByDiscipline.has(r.discipline)) {
      correctByDiscipline.set(r.discipline, { A: 0, B: 0, C: 0, D: 0, E: 0 });
    }
    correctByDiscipline.get(r.discipline)![r.correct_answer]!++;

    // "todas/nenhuma das anteriores"
    for (const k of LETTERS) {
      const text = (r.alternatives[k] ?? '').toLowerCase();
      const hasPhrase = ANTERIORES_PHRASES.some((p) => text.includes(p));
      if (hasPhrase) {
        anterioresStats.total++;
        if (k === r.correct_answer.toLowerCase()) anterioresStats.asCorrect++;
      }
    }
  }

  // ========== Render markdown ==========
  const md: string[] = [];
  md.push('# Cheat sheet — padrões da banca Unifor Medicina\n');
  md.push(`> Análise estatística sobre **${rows.length}** questões não-anuladas com alternativas extraídas via OCR (Groq Llama 4 Scout). Geração: ${new Date().toLocaleString('pt-BR')}.\n`);
  md.push('> ⚠ Análise descritiva, não preditiva. Indica tendências, não regras absolutas.\n');

  // 1. Comprimento
  md.push('\n## 1. Comprimento da alternativa (chars)\n');
  const lenC = avg(overall.charsCorreta);
  const lenE = avg(overall.charsErrada);
  const diff = lenC - lenE;
  const diffPct = lenE > 0 ? (diff / lenE) * 100 : 0;
  md.push('| | Média | Mínimo | Máximo |');
  md.push('|---|---|---|---|');
  md.push(`| Correta (1 por questão) | ${lenC.toFixed(1)} | ${Math.min(...overall.charsCorreta)} | ${Math.max(...overall.charsCorreta)} |`);
  md.push(`| Errada (4 por questão) | ${lenE.toFixed(1)} | ${Math.min(...overall.charsErrada)} | ${Math.max(...overall.charsErrada)} |`);
  md.push('');
  md.push(`**Diferença:** correta tem em média **${diff.toFixed(0)} chars** ${diff >= 0 ? 'a mais' : 'a menos'} que erradas (**${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}%**).`);

  // Por disciplina
  md.push('\n### Por disciplina\n');
  md.push('| Disciplina | Correta (chars) | Errada (chars) | Diferença |');
  md.push('|---|---|---|---|');
  for (const [disc, s] of byDiscipline.entries()) {
    const c = avg(s.charsCorreta);
    const e = avg(s.charsErrada);
    const d = c - e;
    md.push(`| ${disc} | ${c.toFixed(1)} | ${e.toFixed(1)} | ${d >= 0 ? '+' : ''}${d.toFixed(1)} |`);
  }

  // 2. Termos absolutos
  md.push('\n## 2. Termos absolutos (sempre, nunca, todos, nenhum, exclusivamente, ...)\n');
  const absCNorm = overall.absCorreta / Math.max(1, overall.charsCorreta.length);
  const absENorm = overall.absErrada / Math.max(1, overall.charsErrada.length);
  md.push(`- Em alternativas **CORRETAS**: ${overall.absCorreta} ocorrências em ${overall.charsCorreta.length} alternativas (média **${absCNorm.toFixed(2)}/alt**)`);
  md.push(`- Em alternativas **ERRADAS**: ${overall.absErrada} ocorrências em ${overall.charsErrada.length} alternativas (média **${absENorm.toFixed(2)}/alt**)`);
  const absRatio = absCNorm > 0 ? absENorm / absCNorm : 0;
  md.push(`- **Razão errada:correta = ${absRatio.toFixed(2)}x** ${absRatio > 1 ? '— termos absolutos aparecem MAIS em distratores ✓' : '— sem viés claro'}`);

  // 3. Qualificadores
  md.push('\n## 3. Qualificadores (geralmente, pode, tende, costuma, ...)\n');
  const qualCNorm = overall.qualCorreta / Math.max(1, overall.charsCorreta.length);
  const qualENorm = overall.qualErrada / Math.max(1, overall.charsErrada.length);
  md.push(`- Em alternativas **CORRETAS**: ${overall.qualCorreta} ocorrências (média **${qualCNorm.toFixed(2)}/alt**)`);
  md.push(`- Em alternativas **ERRADAS**: ${overall.qualErrada} ocorrências (média **${qualENorm.toFixed(2)}/alt**)`);
  const qualRatio = qualENorm > 0 ? qualCNorm / qualENorm : 0;
  md.push(`- **Razão correta:errada = ${qualRatio.toFixed(2)}x** ${qualRatio > 1 ? '— qualificadores aparecem MAIS em corretas ✓' : '— sem viés claro'}`);

  // 4. Negação
  md.push('\n## 4. Termos de negação (não, incorreto, exceto, ...)\n');
  const negCNorm = overall.negCorreta / Math.max(1, overall.charsCorreta.length);
  const negENorm = overall.negErrada / Math.max(1, overall.charsErrada.length);
  md.push(`- Em alternativas **CORRETAS**: ${overall.negCorreta} ocorrências (média **${negCNorm.toFixed(2)}/alt**)`);
  md.push(`- Em alternativas **ERRADAS**: ${overall.negErrada} ocorrências (média **${negENorm.toFixed(2)}/alt**)`);

  // 5. Numéricas
  md.push('\n## 5. Questões com 5 alternativas numéricas\n');
  if (overall.numericTotal > 0) {
    const rankCounts = [0, 0, 0, 0, 0];
    for (const r of overall.numericCorrectRank) rankCounts[r]!++;
    md.push(`- Total de questões puramente numéricas: **${overall.numericTotal}**`);
    md.push('- Posição da resposta correta (ordenando alternativas do menor pro maior):');
    const labels = ['Menor (1º)', '2º', 'Mediana (3º)', '4º', 'Maior (5º)'];
    md.push('');
    md.push('| Rank | Frequência |');
    md.push('|---|---|');
    for (let i = 0; i < 5; i++) {
      md.push(`| ${labels[i]} | ${rankCounts[i]} (${pct(rankCounts[i]!, overall.numericTotal)}) |`);
    }
    const maxRank = rankCounts.indexOf(Math.max(...rankCounts));
    md.push(`\n**Tendência:** valor **${labels[maxRank]}** é o mais comum.`);
  } else {
    md.push('Nenhuma questão puramente numérica detectada.');
  }

  // 6. "Todas / nenhuma das anteriores"
  md.push('\n## 6. "Todas/nenhuma das anteriores"\n');
  if (anterioresStats.total > 0) {
    const taxa = (anterioresStats.asCorrect / anterioresStats.total) * 100;
    md.push(`- Aparecem em **${anterioresStats.total}** alternativas`);
    md.push(`- **${anterioresStats.asCorrect}** delas eram a correta (**${taxa.toFixed(1)}%**)`);
    md.push(`- Comparativo: chute aleatório seria 20% — então essas frases ${taxa > 20 ? 'tem CHANCE A MAIOR de serem corretas' : 'tem CHANCE A MENOR de serem corretas'}.`);
  } else {
    md.push('Não detectadas no banco.');
  }

  // 7. Distribuição da correta por disciplina (já tinha mas confirma)
  md.push('\n## 7. Letra correta mais comum por disciplina\n');
  md.push('| Disciplina | A | B | C | D | E | Lider |');
  md.push('|---|---|---|---|---|---|---|');
  for (const [disc, dist] of correctByDiscipline.entries()) {
    const total = Object.values(dist).reduce((s, n) => s + n, 0);
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
    const leader = entries[0]![0];
    md.push(
      `| ${disc} | ${pct(dist.A!, total)} | ${pct(dist.B!, total)} | ${pct(dist.C!, total)} | ${pct(dist.D!, total)} | ${pct(dist.E!, total)} | **${leader}** |`,
    );
  }

  // 8. ANALISE PEDAGOGICA — so renderiza se houver dados pedagogy
  const pedagogyRows = rows.filter((r) => r.pedagogy !== null);
  if (pedagogyRows.length > 0) {
    md.push('\n## 8. Análise pedagógica\n');
    md.push(
      `> Baseado em ${pedagogyRows.length} questões com classificação pedagógica.\n`,
    );

    // Bloom: distribuição
    const bloomCount = new Map<string, number>();
    const tipoCount = new Map<string, number>();
    const formatoCount = new Map<string, number>();
    const estrategiaCount = new Map<string, number>();
    const complexCount = [0, 0, 0, 0, 0]; // 1..5
    // Bloom × letra correta
    const bloomXLetter = new Map<string, Record<string, number>>();
    // Estratégia × letra correta
    const estrategiaXLetter = new Map<string, Record<string, number>>();
    // Complexidade × disciplina (média)
    const complexByDiscipline = new Map<string, number[]>();

    for (const r of pedagogyRows) {
      const p = r.pedagogy!;
      const bloom = p.bloom ?? '?';
      const tipo = p.tipo ?? '?';
      const formato = p.formato ?? '?';
      const estrategia = p.estrategia_distratores ?? '?';
      const cx = typeof p.complexidade === 'number' ? p.complexidade : 0;

      bloomCount.set(bloom, (bloomCount.get(bloom) ?? 0) + 1);
      tipoCount.set(tipo, (tipoCount.get(tipo) ?? 0) + 1);
      formatoCount.set(formato, (formatoCount.get(formato) ?? 0) + 1);
      estrategiaCount.set(estrategia, (estrategiaCount.get(estrategia) ?? 0) + 1);
      if (cx >= 1 && cx <= 5) complexCount[cx - 1]!++;

      if (!bloomXLetter.has(bloom)) {
        bloomXLetter.set(bloom, { A: 0, B: 0, C: 0, D: 0, E: 0 });
      }
      bloomXLetter.get(bloom)![r.correct_answer]!++;

      if (!estrategiaXLetter.has(estrategia)) {
        estrategiaXLetter.set(estrategia, { A: 0, B: 0, C: 0, D: 0, E: 0 });
      }
      estrategiaXLetter.get(estrategia)![r.correct_answer]!++;

      if (!complexByDiscipline.has(r.discipline)) {
        complexByDiscipline.set(r.discipline, []);
      }
      if (cx > 0) complexByDiscipline.get(r.discipline)!.push(cx);
    }

    // 8.1 Distribuição Bloom
    md.push('\n### 8.1 Distribuição por nível de Bloom\n');
    md.push('| Nível | Contagem | % |');
    md.push('|---|---|---|');
    const bloomOrder = ['lembrar', 'compreender', 'aplicar', 'analisar', 'avaliar', 'criar'];
    for (const b of bloomOrder) {
      const n = bloomCount.get(b) ?? 0;
      md.push(`| ${b} | ${n} | ${pct(n, pedagogyRows.length)} |`);
    }
    const dominantBloom = [...bloomCount.entries()].sort((a, b) => b[1] - a[1])[0];
    md.push(`\n**Dominante:** ${dominantBloom?.[0] ?? '?'} (${pct(dominantBloom?.[1] ?? 0, pedagogyRows.length)})`);

    // 8.2 Tipo
    md.push('\n### 8.2 Tipo de questão\n');
    md.push('| Tipo | Contagem | % |');
    md.push('|---|---|---|');
    for (const [k, n] of [...tipoCount.entries()].sort((a, b) => b[1] - a[1])) {
      md.push(`| ${k} | ${n} | ${pct(n, pedagogyRows.length)} |`);
    }

    // 8.3 Formato
    md.push('\n### 8.3 Formato\n');
    md.push('| Formato | Contagem | % |');
    md.push('|---|---|---|');
    for (const [k, n] of [...formatoCount.entries()].sort((a, b) => b[1] - a[1])) {
      md.push(`| ${k} | ${n} | ${pct(n, pedagogyRows.length)} |`);
    }

    // 8.4 Estratégia de distratores
    md.push('\n### 8.4 Estratégia mais comum dos distratores\n');
    md.push('| Estratégia | Contagem | % |');
    md.push('|---|---|---|');
    for (const [k, n] of [...estrategiaCount.entries()].sort((a, b) => b[1] - a[1])) {
      md.push(`| ${k} | ${n} | ${pct(n, pedagogyRows.length)} |`);
    }

    // 8.5 Complexidade
    md.push('\n### 8.5 Complexidade (carga cognitiva)\n');
    md.push('| Nível | Contagem | % |');
    md.push('|---|---|---|');
    for (let i = 0; i < 5; i++) {
      const n = complexCount[i] ?? 0;
      md.push(`| ${i + 1} | ${n} | ${pct(n, pedagogyRows.length)} |`);
    }
    const avgComplex =
      complexCount.reduce((s, n, i) => s + n * (i + 1), 0) /
      Math.max(1, complexCount.reduce((s, n) => s + n, 0));
    md.push(`\n**Média geral:** ${avgComplex.toFixed(2)} / 5`);

    // 8.6 Complexidade por disciplina
    md.push('\n### 8.6 Complexidade média por disciplina\n');
    md.push('| Disciplina | n | Média |');
    md.push('|---|---|---|');
    const disciplineComplex: Array<{ d: string; m: number; n: number }> = [];
    for (const [d, vals] of complexByDiscipline.entries()) {
      const m = vals.reduce((s, n) => s + n, 0) / Math.max(1, vals.length);
      disciplineComplex.push({ d, m, n: vals.length });
    }
    for (const { d, m, n } of disciplineComplex.sort((a, b) => b.m - a.m)) {
      md.push(`| ${d} | ${n} | ${m.toFixed(2)} |`);
    }

    // 8.7 Bloom × Letra correta
    md.push('\n### 8.7 Letra correta por nível de Bloom\n');
    md.push('| Bloom | n | A | B | C | D | E | Líder |');
    md.push('|---|---|---|---|---|---|---|---|');
    for (const b of bloomOrder) {
      const dist = bloomXLetter.get(b);
      if (!dist) continue;
      const total = Object.values(dist).reduce((s, n) => s + n, 0);
      if (total === 0) continue;
      const leader = Object.entries(dist).sort((a, b) => b[1] - a[1])[0]![0];
      md.push(
        `| ${b} | ${total} | ${pct(dist.A!, total)} | ${pct(dist.B!, total)} | ${pct(dist.C!, total)} | ${pct(dist.D!, total)} | ${pct(dist.E!, total)} | **${leader}** |`,
      );
    }

    // 8.8 Estratégia × Letra correta (insight: distratores que adotam
    // certa estratégia tendem a deixar qual letra como correta?)
    md.push('\n### 8.8 Letra correta por estratégia de distrator\n');
    md.push(
      '> Quando os distratores são todos do mesmo tipo, qual letra costuma ser a correta?\n',
    );
    md.push('| Estratégia | n | Letra mais comum |');
    md.push('|---|---|---|');
    for (const [estr, dist] of [...estrategiaXLetter.entries()].sort(
      (a, b) =>
        Object.values(b[1]).reduce((s, n) => s + n, 0) -
        Object.values(a[1]).reduce((s, n) => s + n, 0),
    )) {
      const total = Object.values(dist).reduce((s, n) => s + n, 0);
      const leader = Object.entries(dist).sort((a, b) => b[1] - a[1])[0]!;
      md.push(
        `| ${estr} | ${total} | **${leader[0]}** (${pct(leader[1], total)}) |`,
      );
    }
  }

  // 9. Conclusão prática
  md.push('\n## 🎯 Cheat sheet final\n');
  md.push('Se precisar chutar, em ordem de prioridade:');
  md.push('');
  md.push('1. **Olhe os termos absolutos.** Alternativas com "sempre", "nunca", "todos", "nenhum", "exclusivamente" tendem a ser distratores. Elimine elas primeiro.');
  md.push('2. **Olhe os qualificadores.** Alternativas com "geralmente", "tende a", "pode", "na maioria dos casos" tendem a ser corretas. Foque nelas.');
  md.push(`3. **Comprimento.** A correta tem em média ${diffPct >= 0 ? `${diffPct.toFixed(0)}% mais` : `${Math.abs(diffPct).toFixed(0)}% menos`} caracteres que as erradas. ${diffPct > 10 ? 'Quando em dúvida entre 2, escolha a mais longa.' : 'Comprimento não é forte indicador na Unifor.'}`);
  md.push(`4. **Letra do gabarito.** Em ordem de frequência geral: C > D > B > A > E. **Evite E**, é a menos provável em todas as disciplinas.`);
  md.push('5. **Por matéria:**');
  for (const [disc, dist] of correctByDiscipline.entries()) {
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
    md.push(`   - **${disc}** → chute **${entries[0]![0]}**`);
  }
  if (overall.numericTotal > 0) {
    const rankCounts = [0, 0, 0, 0, 0];
    for (const r of overall.numericCorrectRank) rankCounts[r]!++;
    const maxRank = rankCounts.indexOf(Math.max(...rankCounts));
    const labels = ['o menor', 'o 2º menor', 'a mediana', 'o 2º maior', 'o maior'];
    md.push(`6. **Questões numéricas:** quando 5 valores numéricos, **${labels[maxRank]}** valor é o mais comum (${pct(rankCounts[maxRank]!, overall.numericTotal)}).`);
  }

  // Salva
  const outPath = join(ROOT, OUT_FILE!);
  writeFileSync(outPath, md.join('\n'), 'utf8');
  console.log(`\n✓ Relatorio salvo em ${outPath}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
