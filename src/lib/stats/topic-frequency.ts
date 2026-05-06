/**
 * Helpers compartilhados pra mapa "MAIS CAI" — top-3 tópicos por disciplina,
 * descartando questões anuladas. Consumido pelo `<TopicMapMatrix>` em
 * /estatisticas (mode=explore) e /quiz (mode=quiz).
 */

export interface TopicNode {
  topic: string;
  count: number;
}

export interface DisciplineTopicNode {
  discipline: string;
  count: number;
  topics: TopicNode[];
}

/**
 * Top-3 tópicos por disciplina (decisão 2A travada): os 3 com maior count.
 * Empate em count: ordem alfabética estável (`localeCompare pt-BR`).
 * Tópico só conta se aparecer em pelo menos 1 prova (count > 0).
 */
export function getTopTopicsByDiscipline(
  data: DisciplineTopicNode[],
  topN = 3,
): Map<string, TopicNode[]> {
  const out = new Map<string, TopicNode[]>();
  for (const d of data) {
    const sorted = [...d.topics]
      .filter((t) => t.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.topic.localeCompare(b.topic, 'pt-BR');
      })
      .slice(0, topN);
    out.set(d.discipline, sorted);
  }
  return out;
}

/**
 * Aplica acerto do usuário (resolved/correct por disciplina) num formato fácil
 * de consumir no card. Quando `resolved.total === 0`, retorna `null` em pct
 * pra UI mostrar "Sem progresso ainda".
 */
export interface DisciplineProgress {
  total: number;
  resolved: number;
  correct: number;
  pct: number | null;
}

export function buildDisciplineProgress(
  total: number,
  resolved: number,
  correct: number,
): DisciplineProgress {
  return {
    total,
    resolved,
    correct,
    pct: resolved === 0 ? null : Math.round((correct / resolved) * 100),
  };
}
