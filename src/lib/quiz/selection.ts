/**
 * State helpers para seleção compartilhada entre TopicMapMatrix, QuizSetupForm
 * e DisciplineBarChart (PR 29).
 *
 * Cada item é uma string no formato:
 *   - "discipline:*"        — toda a disciplina (todos os subtópicos)
 *   - "discipline:subtopic" — subtópico específico
 *
 * Os helpers operam sobre um `Set<SelectionItem>` imutável (sempre retornam
 * uma nova instância) pra facilitar a integração com `useState`.
 */

import type { DisciplineTopicNode } from '@/lib/stats/topic-frequency';

/** Item canônico: "discipline:*" ou "discipline:subtopic". */
export type SelectionItem = string;
export type SelectionState = Set<SelectionItem>;

const URL_PARAM = 'selected';

/** Constrói o ID canônico para um par disciplina/subtópico. */
export function makeItem(discipline: string, subtopic: string | null | undefined): SelectionItem {
  const sub = subtopic && subtopic.trim() !== '' ? subtopic : '*';
  return `${discipline}:${sub}`;
}

/** Constrói o ID "tudo" para uma disciplina. */
export function makeAllItem(discipline: string): SelectionItem {
  return `${discipline}:*`;
}

/** Quebra um item em (discipline, subtopic|'*'). Retorna null se inválido. */
export function parseItem(item: SelectionItem): { discipline: string; subtopic: string } | null {
  const idx = item.indexOf(':');
  if (idx <= 0) return null;
  const discipline = item.slice(0, idx);
  const subtopic = item.slice(idx + 1);
  if (!discipline || !subtopic) return null;
  return { discipline, subtopic };
}

/** Lê o parâmetro `?selected=...` da URL e retorna um Set normalizado. */
export function parseSelectionFromUrl(searchParams: URLSearchParams): SelectionState {
  const raw = searchParams.get(URL_PARAM);
  if (!raw) return new Set();
  const out = new Set<SelectionItem>();
  for (const piece of raw.split(',')) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    const parsed = parseItem(trimmed);
    if (parsed) out.add(`${parsed.discipline}:${parsed.subtopic}`);
  }
  return out;
}

/** Serializa o Set num valor adequado pra `?selected=...`. */
export function selectionToUrlParam(state: SelectionState): string {
  return [...state].sort().join(',');
}

/** Nome do parâmetro de URL que a seleção usa. */
export const SELECTION_URL_PARAM = URL_PARAM;

/** Toggle imutável: adiciona se ausente, remove se presente. */
export function toggleItem(state: SelectionState, item: SelectionItem): SelectionState {
  const next = new Set(state);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
}

/** Adiciona muitos itens de uma vez. */
export function addItems(state: SelectionState, items: Iterable<SelectionItem>): SelectionState {
  const next = new Set(state);
  for (const it of items) next.add(it);
  return next;
}

/**
 * Resolve `discipline:*` em todos os subtópicos disponíveis daquela disciplina,
 * usando o snapshot do banco passado em `allTopics`.
 *
 * Itens com subtópico específico passam direto. Itens com disciplina inexistente
 * em `allTopics` são descartados.
 */
export function expandSelection(
  state: SelectionState,
  allTopics: DisciplineTopicNode[],
): Array<{ discipline: string; subtopic: string }> {
  const byDiscipline = new Map<string, DisciplineTopicNode>();
  for (const d of allTopics) byDiscipline.set(d.discipline, d);

  const out: Array<{ discipline: string; subtopic: string }> = [];
  const seen = new Set<string>();

  for (const item of state) {
    const parsed = parseItem(item);
    if (!parsed) continue;
    const { discipline, subtopic } = parsed;

    if (subtopic === '*') {
      const node = byDiscipline.get(discipline);
      if (!node) continue;
      for (const t of node.topics) {
        const key = `${discipline}:${t.topic}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ discipline, subtopic: t.topic });
      }
    } else {
      const key = `${discipline}:${subtopic}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ discipline, subtopic });
    }
  }
  return out;
}

/**
 * Conta quantas questões a seleção atual cobre, somando counts dos topics
 * resolvidos. Itens "discipline:*" usam o `count` total da disciplina (que já
 * é o somatório dos subtópicos no snapshot). Itens específicos somam só o
 * count daquele subtópico.
 */
export function countQuestionsInSelection(
  state: SelectionState,
  allTopics: DisciplineTopicNode[],
): number {
  if (state.size === 0) return 0;
  const byDiscipline = new Map<string, DisciplineTopicNode>();
  for (const d of allTopics) byDiscipline.set(d.discipline, d);

  // Se a disciplina inteira foi selecionada, ignoramos itens específicos da
  // mesma disciplina (já estão cobertos pelo "*"). Somamos topic.count nas
  // demais.
  const allDisc = new Set<string>();
  for (const item of state) {
    const p = parseItem(item);
    if (p && p.subtopic === '*') allDisc.add(p.discipline);
  }

  let total = 0;
  const counted = new Set<string>();
  for (const item of state) {
    const p = parseItem(item);
    if (!p) continue;
    const node = byDiscipline.get(p.discipline);
    if (!node) continue;
    if (p.subtopic === '*') {
      if (counted.has(`disc:${p.discipline}`)) continue;
      counted.add(`disc:${p.discipline}`);
      total += node.count;
    } else {
      if (allDisc.has(p.discipline)) continue; // já contado via "*"
      const t = node.topics.find((tt) => tt.topic === p.subtopic);
      if (!t) continue;
      const key = `topic:${p.discipline}:${p.subtopic}`;
      if (counted.has(key)) continue;
      counted.add(key);
      total += t.count;
    }
  }
  return total;
}

/** Conta quantos itens distintos a seleção tem (sem expandir "*"). */
export function countSelectedItems(state: SelectionState): number {
  return state.size;
}
