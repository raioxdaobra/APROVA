/**
 * PR 24 — Extrai metadados de questões dos PDFs compilados por disciplina em
 * `OneDrive/Documentos/APROVA/PROVAS MEDICINA UNIFOR/OUTROS/`.
 *
 * Contexto importante (descoberto na calibração):
 *   Os PDFs compilados ("Estudo Dirigido — {Disciplina}") são CATÁLOGOS
 *   visuais: cada questão é apresentada como IMAGEM em alta resolução (200
 *   DPI) preservando o layout original da prova. O texto extraível com
 *   pdf-parse contém apenas:
 *     - Capa, sumário e títulos de subtópicos
 *     - "Questão NN Unifor YYYY-S • <subtópico>" como cabeçalhos
 *     - Tabela final do GABARITO no formato:
 *         Prova Questão Subtópico Resposta
 *         2024-1 17 Subtópico texto X
 *
 *   Como o enunciado e as alternativas só existem na imagem, NÃO é possível
 *   reconstruir `description` rica via texto. O que conseguimos extrair com
 *   alta confiança é o tripé `(prova, questão_num, subtópico, resposta)`.
 *
 * Estratégia adotada:
 *   1. Para cada PDF compilado em OUTROS/, lê texto e localiza tabelas de
 *      gabarito (uma por subtópico, ou uma única tabela global).
 *   2. Constrói registros canônicos {year, semester, questionNum, subtopic,
 *      correctAnswer, discipline}.
 *   3. Gera ID canônico `{ano}-{semestre}_Q{NN}` (mesmo formato usado pelo
 *      seed principal `seed-questions.ts` e por `extract_linguagens.ts`),
 *      garantindo **dedupe automática** via `ON CONFLICT (id) DO NOTHING`:
 *      questões oficiais já presentes no banco (vindas das 680 do seed
 *      principal ou das 326 de Linguagens) NÃO são sobrescritas.
 *   4. Para questões NOVAS (não existentes), insere stub com:
 *        description = '[Questão em imagem — consulte PDF compilado de {disciplina}]'
 *        image_url   = ''  (NOT NULL aceita string vazia)
 *      Pipeline futuro pode rodar OCR ou seed específico que sobrescreva.
 *
 * Anti-padrão respeitado:
 *   - NÃO inventa correct_answer: pula linhas onde não conseguimos parsear
 *     letra A-E confiável.
 *   - NÃO duplica: ON CONFLICT DO NOTHING garante idempotência.
 *
 * Reporte: stats por disciplina (linhas extraídas do gabarito) + total de
 * inserts gerados + PDFs com falha.
 *
 * Uso: `npx tsx scripts/extract_compilados.ts [--debug]`
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
// PDFs vivem na pasta OneDrive do user — não na raiz do repo. Em ambiente
// dev local (C:\Users\engar como repo) o `join(ROOT, 'OneDrive', ...)`
// resolve. Em worktrees / CI sem OneDrive sincronizada, fallback para
// HOME/OneDrive.
const HOME = process.env.HOME || process.env.USERPROFILE || '';
const CANDIDATE_OUTROS_DIRS = [
  join(ROOT, 'OneDrive', 'Documentos', 'APROVA', 'PROVAS MEDICINA UNIFOR', 'OUTROS'),
  join(HOME, 'OneDrive', 'Documentos', 'APROVA', 'PROVAS MEDICINA UNIFOR', 'OUTROS'),
];
const OUTROS_DIR =
  CANDIDATE_OUTROS_DIRS.find((p) => existsSync(p)) ?? CANDIDATE_OUTROS_DIRS[0]!;
const OUT_SQL = join(ROOT, 'supabase', 'migrations', '0026_seed_compilados.sql');

const DEBUG = process.argv.includes('--debug');

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Letter = 'A' | 'B' | 'C' | 'D' | 'E';

interface CompiladoRow {
  year: number;
  semester: number;
  questionNum: number;
  subtopic: string;
  correctAnswer: Letter;
  discipline: string;
  source: string;
}

interface FileResult {
  file: string;
  discipline: string;
  rows: CompiladoRow[];
  failed: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Mapping arquivo → disciplina
// ---------------------------------------------------------------------------

const DISCIPLINE_MAP: { match: RegExp; discipline: string }[] = [
  { match: /^Biologia_Unifor_Medicina_Compilado/i, discipline: 'biologia' },
  { match: /^Fisica_Unifor_Medicina_Compilado/i, discipline: 'fisica' },
  { match: /^Quimica_Unifor_Medicina_Compilado/i, discipline: 'quimica' },
  { match: /^Matematica_Unifor_Medicina_Compilado/i, discipline: 'matematica' },
  { match: /^Humanas_Unifor_Medicina_Compilado/i, discipline: 'humanas' },
  { match: /^Biologia_Piloto/i, discipline: 'biologia' },
];

function disciplineFromFilename(filename: string): string | null {
  for (const { match, discipline } of DISCIPLINE_MAP) {
    if (match.test(filename)) return discipline;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers de PDF
// ---------------------------------------------------------------------------

async function extractPdfText(path: string): Promise<string> {
  const buf = readFileSync(path);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

// ---------------------------------------------------------------------------
// Parsing das tabelas de gabarito
// ---------------------------------------------------------------------------

/**
 * Padrão "Compilado padrão" (Biologia/Fisica/Quimica/Matematica/Humanas):
 *   Cada subtópico tem cabeçalho `Prova Questão Subtópico Resposta` seguido
 *   por linhas no formato:
 *     2024-1 17 Subtópico (pode quebrar várias linhas) X
 *
 *   Subtópico pode quebrar em múltiplas linhas no PDF — é tudo até a letra
 *   final A-E. Buscamos com regex multilinha.
 *
 * Padrão "Piloto":
 *   Cabeçalho `Subtópico Questão Prova Resposta` (ordem diferente!) com:
 *     Ecologia — texto 26 2026.1 C
 */
function parseStandardCompilado(text: string): CompiladoRow[] {
  // Localiza posições onde aparece "Prova Questão Subtópico Resposta" para
  // delimitar cada bloco de tabela. Cada bloco vai até o próximo cabeçalho
  // "<n>. <Subtópico>" ou outra ocorrência de "Prova Questão" ou fim.
  const rows: CompiladoRow[] = [];

  // Regex que captura uma linha-completa de gabarito independente do
  // contexto: prova "YYYY-S" + número 1-2 dígitos + texto livre + letra A-E
  // no FIM. O subtópico pode conter quebras de linha; o pdf-parse gera
  // texto em ordem de leitura visual então linhas adjacentes formam o
  // subtópico. Estratégia: percorrer por linhas, juntar continuações e
  // emitir quando encontramos uma letra final.
  //
  // Heurística de linha: começa com `YYYY-S \d+` e termina (eventualmente)
  // com letra única A-E. Linhas de continuação não começam assim.

  const lines = text.split(/\r?\n/);
  const startRe = /^(\d{4})-([12])\s+(\d{1,2})\s+(.*)$/;
  const endLetterRe = /^(.*?)[\s ]+([A-E])\s*$/;
  const onlyLetterRe = /^([A-E])\s*$/;

  let cur: { year: number; semester: number; num: number; subtopicAcc: string } | null = null;

  const flush = (letter: Letter) => {
    if (!cur) return;
    const subtopic = cur.subtopicAcc.replace(/\s+/g, ' ').trim();
    if (subtopic.length === 0) return;
    rows.push({
      year: cur.year,
      semester: cur.semester,
      questionNum: cur.num,
      subtopic,
      correctAnswer: letter,
      discipline: '', // preenchido depois
      source: '', // preenchido depois
    });
    cur = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Ignora cabeçalhos da tabela
    if (/^Prova\s+Quest[ãa]o\s+Subt[oó]pico\s+Resposta$/i.test(line)) {
      cur = null;
      continue;
    }
    // Ignora cabeçalhos de seção tipo "1. Citologia..."
    if (/^\d{1,2}\.\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(line)) {
      cur = null;
      continue;
    }
    // Ignora rodapés de página
    if (/--\s*\d+\s+of\s+\d+\s*--/.test(line)) continue;
    if (/^Estudo\s+Dirigido/.test(line)) continue;
    if (/^P[áa]gina\s+\d+\s+de\s+\d+/.test(line)) continue;

    const startMatch = startRe.exec(line);
    if (startMatch) {
      // Se já tinha um `cur` em construção sem letra final, descarta-o
      // (linha mal formada / preview de continuação)
      if (cur) cur = null;
      const year = parseInt(startMatch[1]!, 10);
      const semester = parseInt(startMatch[2]!, 10);
      const num = parseInt(startMatch[3]!, 10);
      const restRaw = startMatch[4]!.trim();
      // A linha pode ter o subtópico inteiro + letra final, ou só começar
      const endMatch = endLetterRe.exec(restRaw);
      if (endMatch && endMatch[1]!.trim().length > 0) {
        // Linha completa em uma só linha
        cur = { year, semester, num, subtopicAcc: endMatch[1]!.trim() };
        flush(endMatch[2]! as Letter);
      } else {
        // Continua nas próximas linhas
        cur = { year, semester, num, subtopicAcc: restRaw };
      }
      continue;
    }

    // Linha de continuação ou letra solta de fechamento
    if (cur) {
      const onlyLetter = onlyLetterRe.exec(line);
      if (onlyLetter) {
        flush(onlyLetter[1]! as Letter);
        continue;
      }
      const endMatch = endLetterRe.exec(line);
      if (endMatch) {
        const tail = endMatch[1]!.trim();
        if (tail.length > 0) cur.subtopicAcc += ' ' + tail;
        flush(endMatch[2]! as Letter);
        continue;
      }
      // continuação pura
      cur.subtopicAcc += ' ' + line;
    }
  }

  return rows;
}

/**
 * Parser específico do Piloto (Biologia_Piloto_2026-1.pdf):
 *   Cabeçalho: `Subtópico Questão Prova Resposta`
 *   Linhas:    Ecologia — texto 26 2026.1 C
 *
 *   Ordem invertida: subtópico vem ANTES; questão e prova depois; letra
 *   final. Subtópico pode ser multilinha.
 */
function parsePilotoCompilado(text: string): CompiladoRow[] {
  const rows: CompiladoRow[] = [];
  const lines = text.split(/\r?\n/);

  // Procura "Subtópico Questão Prova Resposta" como pivô (header da tabela)
  // e processa apenas o trecho após esse marcador.
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^Subt[oó]pico\s+Quest[ãa]o\s+Prova\s+Resposta$/i.test(lines[i]!.trim())) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return rows;

  // Linha alvo (após junção): "<subtópico texto> <num> <YYYY.S> <Letra>"
  // Junta linhas em janelas crescentes até encontrar match.
  const target =
    /^(.+?)\s+(\d{1,2})\s+(\d{4})\.([12])\s+([A-E])\s*$/;

  let acc: string[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;
    if (/--\s*\d+\s+of\s+\d+\s*--/.test(line)) continue;
    if (/^Estudo\s+Dirigido/.test(line)) continue;
    if (/^P[áa]gina\s+\d+\s+de\s+\d+/.test(line)) continue;
    if (/^Observa[çc][ãa]o:/i.test(line)) break;
    if (/^Gabarito\b/i.test(line)) continue;
    acc.push(line);
    const joined = acc.join(' ');
    const m = target.exec(joined);
    if (m) {
      const subtopic = m[1]!.replace(/\s+/g, ' ').trim();
      const num = parseInt(m[2]!, 10);
      const year = parseInt(m[3]!, 10);
      const semester = parseInt(m[4]!, 10);
      const letter = m[5]! as Letter;
      rows.push({
        year,
        semester,
        questionNum: num,
        subtopic,
        correctAnswer: letter,
        discipline: '',
        source: '',
      });
      acc = [];
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Heurística de subtopic_short
// ---------------------------------------------------------------------------

function shortenSubtopic(subtopic: string): string {
  // Remove parênteses anos, pega antes do " — " ou " / " ou ":"
  let s = subtopic.replace(/\(\d{4}\)/g, '').trim();
  const cuts = [' — ', ' – ', ' / ', ': ', ':', ' - '];
  for (const c of cuts) {
    const idx = s.indexOf(c);
    if (idx > 0 && idx < 40) {
      s = s.slice(0, idx).trim();
      break;
    }
  }
  // Limita a 50 chars
  if (s.length > 50) s = s.slice(0, 47).trim() + '...';
  return s || subtopic.slice(0, 50);
}

// ---------------------------------------------------------------------------
// Processamento por arquivo
// ---------------------------------------------------------------------------

async function processFile(filePath: string): Promise<FileResult> {
  const file = basename(filePath);
  const discipline = disciplineFromFilename(file);
  if (!discipline) {
    return {
      file,
      discipline: 'unknown',
      rows: [],
      failed: true,
      reason: 'disciplina não reconhecida pelo nome',
    };
  }

  let text: string;
  try {
    text = await extractPdfText(filePath);
  } catch (err) {
    return {
      file,
      discipline,
      rows: [],
      failed: true,
      reason: `erro lendo PDF: ${(err as Error).message}`,
    };
  }

  const isPiloto = /Piloto/i.test(file);
  const rows = isPiloto
    ? parsePilotoCompilado(text)
    : parseStandardCompilado(text);

  // Source label: piloto vs compilado
  const source = isPiloto ? 'piloto' : `compilado:${discipline}`;
  for (const r of rows) {
    r.discipline = discipline;
    r.source = source;
  }

  if (rows.length === 0) {
    return {
      file,
      discipline,
      rows: [],
      failed: true,
      reason: 'nenhuma linha de gabarito reconhecida',
    };
  }

  return { file, discipline, rows, failed: false };
}

// ---------------------------------------------------------------------------
// Geração de SQL idempotente
// ---------------------------------------------------------------------------

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function buildSql(allRows: CompiladoRow[]): string {
  const header =
    `-- =============================================================================\n` +
    `-- Migration 0026 — Seed de questões dos PDFs compilados (OUTROS/)\n` +
    `-- =============================================================================\n` +
    `-- Gerado por scripts/extract_compilados.ts a partir dos compilados por\n` +
    `-- disciplina em 'PROVAS MEDICINA UNIFOR/OUTROS/' (PR 24).\n` +
    `--\n` +
    `-- Contexto: estes PDFs são catálogos visuais — cada questão é\n` +
    `-- apresentada como imagem 200 DPI da prova original. O texto extraível\n` +
    `-- contém apenas a TABELA DE GABARITO ao final, com os campos:\n` +
    `--   prova (YYYY-S), questão (1-60), subtópico, resposta (A-E)\n` +
    `--\n` +
    `-- Estratégia: gerar IDs canônicos '{ano}-{sem}_Q{NN}' alinhados ao seed\n` +
    `-- principal. INSERT ... ON CONFLICT (id) DO NOTHING garante:\n` +
    `--   - questões oficiais já existentes no banco NÃO são sobrescritas\n` +
    `--   - questões NOVAS (de provas/questões ainda não seedadas) entram\n` +
    `--     como stub (description placeholder, image_url vazia)\n` +
    `--\n` +
    `-- Disciplinas cobertas: biologia, fisica, quimica, matematica, humanas\n` +
    `-- Anuladas/retificações: não aplicáveis (texto-fonte é o gabarito final).\n` +
    `-- =============================================================================\n\n`;

  // Dedupe (id, source) — o mesmo (year,sem,questionNum) pode aparecer duas
  // vezes no mesmo PDF (ex.: piloto 2026-1 também presente no compilado).
  // Mantém a primeira ocorrência por id.
  const seen = new Set<string>();
  const lines: string[] = [];

  // Ordena por id para SQL determinístico
  allRows.sort((a, b) => {
    if (a.discipline !== b.discipline) return a.discipline.localeCompare(b.discipline);
    if (a.year !== b.year) return a.year - b.year;
    if (a.semester !== b.semester) return a.semester - b.semester;
    return a.questionNum - b.questionNum;
  });

  for (const r of allRows) {
    const id = `${r.year}-${r.semester}_Q${String(r.questionNum).padStart(2, '0')}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const subtopicShort = shortenSubtopic(r.subtopic);
    const description =
      `[Questão em imagem — consulte o PDF compilado de ${r.discipline} ` +
      `(prova ${r.year}.${r.semester} · questão ${r.questionNum}).]`;
    lines.push(
      `insert into public.questions (id, discipline, subtopic, subtopic_short, year, semester, question_num, description, image_url, correct_answer, annulled)\n` +
        `values (\n` +
        `  '${sqlEscape(id)}',\n` +
        `  '${sqlEscape(r.discipline)}',\n` +
        `  '${sqlEscape(r.subtopic)}',\n` +
        `  '${sqlEscape(subtopicShort)}',\n` +
        `  ${r.year},\n` +
        `  ${r.semester},\n` +
        `  ${r.questionNum},\n` +
        `  '${sqlEscape(description)}',\n` +
        `  '',\n` +
        `  '${r.correctAnswer}',\n` +
        `  false\n` +
        `) on conflict (id) do nothing;`
    );
  }
  return header + lines.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(OUTROS_DIR)) {
    console.error(`OUTROS_DIR não existe: ${OUTROS_DIR}`);
    process.exit(1);
  }
  const all = readdirSync(OUTROS_DIR);
  const pdfs = all
    .filter((n) => /\.pdf$/i.test(n))
    .filter((n) => disciplineFromFilename(n) !== null);

  console.log(`encontrados ${pdfs.length} PDFs compilados em OUTROS/`);

  const results: FileResult[] = [];
  for (const name of pdfs) {
    process.stdout.write(`  ${name} ... `);
    const res = await processFile(join(OUTROS_DIR, name));
    if (res.failed) {
      console.log(`FALHOU (${res.reason})`);
    } else {
      console.log(`${res.rows.length} linhas (${res.discipline})`);
    }
    results.push(res);
  }

  const allRows: CompiladoRow[] = [];
  for (const r of results) allRows.push(...r.rows);

  // Stats por disciplina (e dedupe por id pra "questões únicas")
  const byDisc = new Map<string, Set<string>>();
  for (const r of allRows) {
    const id = `${r.year}-${r.semester}_Q${String(r.questionNum).padStart(2, '0')}`;
    if (!byDisc.has(r.discipline)) byDisc.set(r.discipline, new Set());
    byDisc.get(r.discipline)!.add(id);
  }

  const sql = buildSql(allRows);
  writeFileSync(OUT_SQL, sql, 'utf8');

  console.log('---');
  console.log('linhas extraídas por disciplina:');
  for (const [disc, ids] of [...byDisc.entries()].sort()) {
    console.log(`  ${disc}: ${ids.size} questões únicas`);
  }
  console.log(`linhas totais: ${allRows.length}`);
  const totalUnique = new Set(allRows.map((r) => `${r.year}-${r.semester}_Q${r.questionNum}`)).size;
  console.log(`IDs únicos (após dedupe): ${totalUnique}`);
  const failures = results.filter((r) => r.failed);
  console.log(`PDFs com falha: ${failures.length}`);
  for (const f of failures) {
    console.log(`  - ${f.file}: ${f.reason}`);
  }
  console.log(`SQL escrito em: ${OUT_SQL}`);
  console.log(
    'Nota: idempotência via ON CONFLICT garante que questões oficiais já no banco (do seed principal de 680 ou do seed Linguagens 0023) NÃO são sobrescritas — apenas questões NOVAS entram como stub com placeholder de descrição.'
  );
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
