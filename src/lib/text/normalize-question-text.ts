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
 *
 * Retorna lista de parágrafos prontos pra renderizar como `<p>`.
 */
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
      const isTitle =
        line.length <= 60 &&
        /^[A-ZÁÉÍÓÚÀÂÊÎÔÛÃÕÇ0-9][A-ZÁÉÍÓÚÀÂÊÎÔÛÃÕÇ0-9\s\d.,!?:'"()\-–—]+$/.test(line);
      if (isTitle) {
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

  return out.map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
