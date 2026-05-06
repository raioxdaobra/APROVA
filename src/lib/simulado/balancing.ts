/**
 * Lógica de balanceamento + distribuição usada pelo simulado multi-tópico.
 * Pure functions — sem dependência de React/Supabase, fáceis de testar.
 */

import type { DisciplineTopicNode } from '@/lib/stats/topic-frequency';
import { topicIdOf } from '@/components/topic-map-matrix';

export interface DisciplineSliceStat {
  discipline: string;
  /** Questões disponíveis nos tópicos selecionados desta disciplina. */
  selectedCount: number;
  /** Total de questões da disciplina no banco (todos os tópicos). */
  totalCount: number;
  /** % das questões selecionadas que vêm desta disciplina. */
  pctOfSelection: number;
  /** % que esta disciplina representa no banco completo. */
  pctOfBank: number;
  /** Diferença em pontos percentuais (selection - bank). > 0 = sobre-representada. */
  deltaPp: number;
}

export interface SelectionSummary {
  totalSelectedTopics: number;
  totalAvailableQuestions: number;
  byDiscipline: DisciplineSliceStat[];
}

/**
 * Calcula contagem por disciplina das questões disponíveis nos tópicos
 * selecionados, mais a fatia proporcional do banco.
 */
export function summarizeSelection(
  data: DisciplineTopicNode[],
  selectedTopics: Set<string>,
): SelectionSummary {
  const totalBank = data.reduce((sum, d) => sum + d.count, 0);
  const slices: DisciplineSliceStat[] = [];
  let totalSelectedQuestions = 0;
  let totalSelectedTopics = 0;

  for (const d of data) {
    let selectedCount = 0;
    for (const t of d.topics) {
      const id = topicIdOf(d.discipline, t.topic);
      if (selectedTopics.has(id)) {
        selectedCount += t.count;
        totalSelectedTopics += 1;
      }
    }
    totalSelectedQuestions += selectedCount;
    slices.push({
      discipline: d.discipline,
      selectedCount,
      totalCount: d.count,
      pctOfSelection: 0, // preenchido depois
      pctOfBank: totalBank > 0 ? (d.count / totalBank) * 100 : 0,
      deltaPp: 0,
    });
  }

  for (const s of slices) {
    s.pctOfSelection =
      totalSelectedQuestions > 0
        ? (s.selectedCount / totalSelectedQuestions) * 100
        : 0;
    s.deltaPp = s.pctOfSelection - s.pctOfBank;
  }

  return {
    totalSelectedTopics,
    totalAvailableQuestions: totalSelectedQuestions,
    byDiscipline: slices,
  };
}

/**
 * Computa a próxima Set<string> de tópicos a selecionar para "balancear automático":
 * - target = TARGET_DEFAULT
 * - pra cada disciplina computa target * (countDisc / totalBanco) = quota
 * - seleciona top-N tópicos (por count) até atingir a quota
 * - NÃO desmarca o que já tinha — só adiciona o que falta
 */
export function balanceSelection(
  data: DisciplineTopicNode[],
  current: Set<string>,
  target: number,
): Set<string> {
  const next = new Set(current);
  const totalBank = data.reduce((sum, d) => sum + d.count, 0);
  if (totalBank === 0 || target <= 0) return next;

  for (const d of data) {
    const quota = Math.round(target * (d.count / totalBank));
    if (quota <= 0) continue;

    // Tópicos ordenados por count desc (mais frequentes primeiro), com tie-break alfabético
    const sortedTopics = [...d.topics]
      .filter((t) => t.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.topic.localeCompare(b.topic, 'pt-BR');
      });

    // Soma o que já tinha selecionado dessa disciplina
    let acc = 0;
    for (const t of sortedTopics) {
      const id = topicIdOf(d.discipline, t.topic);
      if (next.has(id)) acc += t.count;
    }
    if (acc >= quota) continue; // já tá ok

    // Adiciona top-N tópicos ainda não selecionados até atingir quota
    for (const t of sortedTopics) {
      if (acc >= quota) break;
      const id = topicIdOf(d.discipline, t.topic);
      if (!next.has(id)) {
        next.add(id);
        acc += t.count;
      }
    }
  }

  return next;
}

/**
 * Pré-seleção "MAIS CAI" — top-3 tópicos de cada disciplina (até 6×3 = 18 tópicos).
 */
export function topNPerDiscipline(
  data: DisciplineTopicNode[],
  n: number,
): Set<string> {
  const out = new Set<string>();
  for (const d of data) {
    const sorted = [...d.topics]
      .filter((t) => t.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.topic.localeCompare(b.topic, 'pt-BR');
      })
      .slice(0, n);
    for (const t of sorted) {
      out.add(topicIdOf(d.discipline, t.topic));
    }
  }
  return out;
}
