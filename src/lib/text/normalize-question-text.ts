/**
 * Normaliza descrição textual de questões que vieram de OCR de PDF.
 *
 * O OCR coloca \n em CADA quebra visual de linha do PDF, mesmo no meio de
 * frases. Aplicado cru com `whitespace-pre-wrap`, o texto sai com quebras
 * arbitrárias ("uma\nvida mais\nsaudável está cada vez mais") que quebram
 * a leitura. Esta função:
 *
 * - Separa parágrafos por linhas em branco (`\n\s*\n+`).
 * - Promove linhas em CAIXA ALTA curtas a parágrafos isolados (são títulos
 *   tipo "A DIETA CERTA", "TEXTO I", etc).
 * - Junta o resto numa única linha por parágrafo, com espaços, removendo
 *   quebras-no-meio-da-frase.
 * - Quebra alternativas `(A) ... (B) ... (C) ...` em parágrafos separados,
 *   um por alternativa.
 * - Trunca o texto após `(E) ...` quando detecta título-de-próxima-questão
 *   logo em seguida (ex: "COM QUE ROUPA?" que vazou do OCR de outra questão).
 *
 * Retorna lista de parágrafos prontos pra renderizar como `<p>`.
 */
const ALT_MARKER = /(\([A-E]\))/g;
const TITLE_RE = /^[A-ZÁÉÍÓÚÀÂÊÎÔÛÃÕÇ0-9][A-ZÁÉÍÓÚÀÂÊÎÔÛÃÕÇ0-9\s\d.,!?:'"()\-–—]+$/;

function looksLikeTitle(line: string): boolean {
  return line.length <= 60 && TITLE_RE.test(line);
}

export function normalizeQuestionText(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const cleaned = raw.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const blocks = cleaned.split(/\n\s*\n+/);
  const out: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    let buffer = '';
    for (const line of lines) {
      if (looksLikeTitle(line)) {
        if (buffer) {
          out.push(buffer);
          buffer = '';
        }
        out.push(line);
        continue;
      }
      buffer = buffer ? `${buffer} ${line}` : line;
    }
    if (buffer) out.push(buffer);
  }

  // Limpa whitespace dentro de cada parágrafo.
  const cleanedParas = out
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // Quebra parágrafos que misturam alternativas "(A) ... (B) ... (C) ..." em
  // múltiplos parágrafos — cada alternativa numa linha própria pra leitura.
  const splitParas: string[] = [];
  for (const para of cleanedParas) {
    if (!/\([A-E]\)/.test(para)) {
      splitParas.push(para);
      continue;
    }
    const segments = para.split(ALT_MARKER);
    const preface = segments[0]?.trim() ?? '';
    if (preface) splitParas.push(preface);
    for (let i = 1; i < segments.length; i += 2) {
      const marker = segments[i];
      const content = (segments[i + 1] ?? '').trim();
      splitParas.push(`${marker} ${content}`.replace(/\s+/g, ' ').trim());
    }
  }

  // Trunca após "(E) ..." se o que vier depois parecer outra questão (título
  // CAIXA-ALTA tipo "COM QUE ROUPA?" que escapou do OCR vizinho).
  let eIdx = -1;
  for (let i = splitParas.length - 1; i >= 0; i -= 1) {
    if (/^\(E\)/.test(splitParas[i] ?? '')) {
      eIdx = i;
      break;
    }
  }
  if (eIdx >= 0 && eIdx < splitParas.length - 1) {
    const after = splitParas.slice(eIdx + 1);
    const hasNextQuestionMarker = after.some((p) => looksLikeTitle(p));
    if (hasNextQuestionMarker) {
      return splitParas.slice(0, eIdx + 1);
    }
  }

  return splitParas;
}
