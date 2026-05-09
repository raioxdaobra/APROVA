/**
 * Banco de frases motivacionais pra hero do dashboard.
 *
 * Categorias:
 *  - generic: serve sempre, fallback default
 *  - streak_strong: streak >= 7 dias
 *  - streak_broken: user já teve >3 dias mas hoje está em 0
 *  - empty_today: não estudou hoje (atrai)
 *  - heavy_today: estudou >=10 questões hoje (mantém ritmo)
 *
 * Seleção determinística: hash(userId + iso_date + category) → índice no array.
 * Fica estável dentro do dia, muda no dia seguinte.
 */

export type QuoteCategory =
  | 'generic'
  | 'streak_strong'
  | 'streak_broken'
  | 'empty_today'
  | 'heavy_today';

const QUOTES: Record<QuoteCategory, readonly string[]> = {
  generic: [
    'Pequenos passos diários viram aprovação.',
    'Estudo é cumulativo. Cada questão soma.',
    'Disciplina ganha do talento que não treina.',
    'Persistência é o atalho mais curto.',
    'Você não precisa ser o melhor hoje. Precisa ser melhor que ontem.',
    'O segredo não é estudar muito. É não parar.',
    'Confiança vem da repetição.',
    'Cada erro hoje é um acerto na prova.',
    'A aprovação mora na rotina.',
    'Não é sobre velocidade, é sobre ritmo.',
    'O concorrente já começou. Não compense — comece também.',
    'Quem revisa, vence.',
    'Constância é o atalho que ninguém vê.',
    'Um pouco todo dia é mais do que muito de vez em quando.',
    'A prática transforma esforço em hábito.',
  ],
  streak_strong: [
    'Você está numa onda. Mantenha.',
    'Sequência longa não nasce — se cultiva. Continue.',
    'Quem chega aqui, chega lá.',
    'Disciplina virou estilo de vida. Bora.',
    'Esse ritmo é raro. Não solte.',
  ],
  streak_broken: [
    'Tropeçar acontece. Voltar é o que conta.',
    'Não foque no que perdeu. Recomeçar é grátis.',
    'A melhor hora pra retomar é agora.',
    'Você sabe o caminho. Só dar o primeiro passo de novo.',
  ],
  empty_today: [
    'Bora começar com 5 questõezinhas?',
    '10 minutos hoje > 2 horas amanhã.',
    'Pequena dose, grande retorno. Vamos?',
    'Hoje é sempre o melhor dia pra começar.',
    'Comece pequeno. O importante é não pular o dia.',
  ],
  heavy_today: [
    'Você já mandou bem hoje. Mais uma rodada?',
    'Esse fôlego é raro. Aproveita.',
    'Esse foco vale ouro. Estende um pouco mais?',
    'Na zona — bora aproveitar.',
  ],
};

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

interface QuoteContext {
  userId: string;
  isoDate: string; // YYYY-MM-DD
  streakDays?: number;
  hadHigherStreak?: boolean;
  questionsToday?: number;
}

/**
 * Retorna uma frase determinística pro user no dia + contexto.
 * Mesma input → mesmo output. Muda quando muda o dia.
 */
export function getQuoteForUser(ctx: QuoteContext): string {
  const category = pickCategory(ctx);
  const pool = QUOTES[category];
  const idx = simpleHash(ctx.userId + ctx.isoDate + category) % pool.length;
  return pool[idx] ?? QUOTES.generic[0]!;
}

function pickCategory(ctx: QuoteContext): QuoteCategory {
  const streak = ctx.streakDays ?? 0;
  const hadHigher = ctx.hadHigherStreak ?? false;
  const today = ctx.questionsToday ?? 0;

  if (streak >= 7) return 'streak_strong';
  if (streak === 0 && hadHigher) return 'streak_broken';
  if (today === 0) return 'empty_today';
  if (today >= 10) return 'heavy_today';
  return 'generic';
}

/**
 * Saudação dinâmica pelo horário (America/Fortaleza).
 */
export function getGreeting(now: Date = new Date()): string {
  const hour = parseInt(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      hour: '2-digit',
      hour12: false,
    }).format(now),
    10,
  );
  if (hour < 5) return 'Boa madrugada';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Pega o primeiro nome do display_name pra saudação personalizada.
 */
export function firstName(displayName: string | null | undefined): string {
  if (!displayName) return '';
  const parts = displayName.trim().split(/\s+/);
  return parts[0] ?? '';
}
