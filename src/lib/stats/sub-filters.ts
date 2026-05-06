/**
 * Sub-filtros de discipline para Linguagens (PT/ING/ESP) e Humanas
 * (Hist/Geo/Filo/Soc).
 *
 * IMPORTANTE: as regex aqui PRECISAM bater EXATAMENTE com as da migration
 * `supabase/migrations/0024_lingua_subject_views.sql`. Server (view SQL) e
 * client (este helper) usam a mesma classificação para que contagens
 * apareçam consistentes onde quer que a UI calcule local vs SSR.
 *
 * Casos:
 *   - subtopic null/empty -> retorna null (não classifica)
 *   - linguagens com keyword ingl(ê|e)s -> ingles
 *   - linguagens com espanhol/spanish -> espanhol
 *   - linguagens default (Literatura, Funções, etc.) -> portugues
 *   - humanas split por prefixo (História, Geografia, Filosofia, Sociologia,
 *     Cidadania/Trabalho/Sociedade -> sociologia)
 */

import type { Language, HumanasSubject } from '@/lib/supabase/types';

// Regex equivalentes ao SQL `~*` (case-insensitive). Mantenha em sync com
// 0024_lingua_subject_views.sql. JS `\b` em /i é equivalente prático ao
// limite de palavra do SQL `(^|[^a-z])` neste contexto.
const RX_INGLES = /(^|[^a-z])ingl[eê]s/i;
const RX_ESPANHOL = /(^|[^a-z])(espanhol|spanish)/i;

const RX_HISTORIA = /^(hist[oó]ria|history)/i;
const RX_GEOGRAFIA = /^(geografia|geography)/i;
const RX_FILOSOFIA = /^(filosofia|philosophy)/i;
const RX_SOCIOLOGIA = /^(sociologia|sociology|cidadania|trabalho|sociedade)/i;

export function classifyLanguage(subtopic: string | null | undefined): Language | null {
  if (!subtopic) return null;
  if (RX_INGLES.test(subtopic)) return 'ingles';
  if (RX_ESPANHOL.test(subtopic)) return 'espanhol';
  return 'portugues';
}

export function classifySubject(
  subtopic: string | null | undefined,
): HumanasSubject | null {
  if (!subtopic) return null;
  if (RX_HISTORIA.test(subtopic)) return 'historia';
  if (RX_GEOGRAFIA.test(subtopic)) return 'geografia';
  if (RX_FILOSOFIA.test(subtopic)) return 'filosofia';
  if (RX_SOCIOLOGIA.test(subtopic)) return 'sociologia';
  // Fallback alinhado com SQL (else 'historia').
  return 'historia';
}

interface QuestionRow {
  discipline: string;
  subtopic: string;
}

export function countByLanguage(
  questions: ReadonlyArray<QuestionRow>,
): Record<Language, number> {
  const out: Record<Language, number> = { portugues: 0, ingles: 0, espanhol: 0 };
  for (const q of questions) {
    if (q.discipline !== 'linguagens') continue;
    const cls = classifyLanguage(q.subtopic);
    if (cls) out[cls] += 1;
  }
  return out;
}

export function countBySubject(
  questions: ReadonlyArray<QuestionRow>,
): Record<HumanasSubject, number> {
  const out: Record<HumanasSubject, number> = {
    historia: 0,
    geografia: 0,
    filosofia: 0,
    sociologia: 0,
  };
  for (const q of questions) {
    if (q.discipline !== 'humanas') continue;
    const cls = classifySubject(q.subtopic);
    if (cls) out[cls] += 1;
  }
  return out;
}

/**
 * Etiquetas curtas pros mini-tabs de card. Mantém abreviações pra mobile.
 */
export const LANGUAGE_SHORT_LABEL: Record<Language, string> = {
  portugues: 'PT',
  ingles: 'ING',
  espanhol: 'ESP',
};

export const LANGUAGE_FULL_LABEL: Record<Language, string> = {
  portugues: 'Português + Literatura',
  ingles: 'Inglês',
  espanhol: 'Espanhol',
};

export const SUBJECT_SHORT_LABEL: Record<HumanasSubject, string> = {
  historia: 'Hist',
  geografia: 'Geo',
  filosofia: 'Filo',
  sociologia: 'Soc',
};

export const SUBJECT_FULL_LABEL: Record<HumanasSubject, string> = {
  historia: 'História',
  geografia: 'Geografia',
  filosofia: 'Filosofia',
  sociologia: 'Sociologia',
};
