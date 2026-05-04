/**
 * Seed da Trilha — 40 estações distribuídas em 8 ranks (5 por rank).
 *
 * Idempotente: usa `on conflict (id) do update` para refletir mudanças no
 * catálogo sem quebrar o progresso existente (que referencia station_id).
 *
 * Uso: npm run gen:trilha
 *
 * Lê SUPABASE_DB_URL de .env.local (mesma estratégia de pooler IPv4 usada
 * em apply-migrations.ts).
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TrilhaGoalType, TrilhaRankId } from '../src/lib/supabase/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

interface StationSeed {
  id: string;
  rank_id: TrilhaRankId;
  position: number;
  title: string;
  description: string;
  goal_type: TrilhaGoalType;
  goal_target: number;
  goal_filter?: Record<string, unknown>;
  xp_reward: number;
  badge_reward?: string;
}

// 40 estações: 5 por rank * 8 ranks. Cada rank cresce em dificuldade/recompensa.
const STATIONS: readonly StationSeed[] = [
  // ---------------- CALOURO (0–500) ----------------
  {
    id: 'calouro_1',
    rank_id: 'calouro',
    position: 1,
    title: 'Diagnóstico inicial',
    description: 'Faça o teste rápido para descobrir seu ponto de partida.',
    goal_type: 'complete_diagnostic',
    goal_target: 1,
    xp_reward: 30,
  },
  {
    id: 'calouro_2',
    rank_id: 'calouro',
    position: 2,
    title: 'Primeiras 10',
    description: 'Resolva 10 questões de qualquer disciplina para aquecer.',
    goal_type: 'answer_questions',
    goal_target: 10,
    xp_reward: 40,
  },
  {
    id: 'calouro_3',
    rank_id: 'calouro',
    position: 3,
    title: 'Foco em Biologia',
    description: 'Resolva 20 questões de Biologia.',
    goal_type: 'answer_questions',
    goal_target: 20,
    goal_filter: { discipline: 'biologia' },
    xp_reward: 60,
  },
  {
    id: 'calouro_4',
    rank_id: 'calouro',
    position: 4,
    title: 'Primeiro acerto em Matemática',
    description: 'Acerte 5 questões de Matemática.',
    goal_type: 'answer_correct',
    goal_target: 5,
    goal_filter: { discipline: 'matematica' },
    xp_reward: 60,
  },
  {
    id: 'calouro_5',
    rank_id: 'calouro',
    position: 5,
    title: 'Sequência de 3 dias',
    description: 'Estude 3 dias seguidos para criar o hábito.',
    goal_type: 'reach_streak',
    goal_target: 3,
    xp_reward: 80,
    badge_reward: 'streak_7',
  },

  // ---------------- PRÉ-VESTIBULAR (500–1500) ----------------
  {
    id: 'pre_vest_1',
    rank_id: 'pre_vest',
    position: 1,
    title: 'Maratona de Química',
    description: 'Resolva 25 questões de Química.',
    goal_type: 'answer_questions',
    goal_target: 25,
    goal_filter: { discipline: 'quimica' },
    xp_reward: 80,
  },
  {
    id: 'pre_vest_2',
    rank_id: 'pre_vest',
    position: 2,
    title: 'Foco em Física',
    description: 'Acerte 15 questões de Física.',
    goal_type: 'answer_correct',
    goal_target: 15,
    goal_filter: { discipline: 'fisica' },
    xp_reward: 100,
  },
  {
    id: 'pre_vest_3',
    rank_id: 'pre_vest',
    position: 3,
    title: 'Primeiro simulado',
    description: 'Complete um simulado curto.',
    goal_type: 'complete_simulado',
    goal_target: 1,
    xp_reward: 120,
  },
  {
    id: 'pre_vest_4',
    rank_id: 'pre_vest',
    position: 4,
    title: '50 questões respondidas',
    description: 'Acumule 50 questões respondidas no total.',
    goal_type: 'answer_questions',
    goal_target: 50,
    xp_reward: 100,
  },
  {
    id: 'pre_vest_5',
    rank_id: 'pre_vest',
    position: 5,
    title: '15 minutos de foco',
    description: 'Acumule 15 minutos de Pomodoro hoje.',
    goal_type: 'focus_minutes',
    goal_target: 15,
    xp_reward: 80,
  },

  // ---------------- ESTUDANTE (1500–3500) ----------------
  {
    id: 'estudante_1',
    rank_id: 'estudante',
    position: 1,
    title: 'Domínio inicial',
    description: 'Conquiste o domínio do seu primeiro subtópico.',
    goal_type: 'master_subtopics',
    goal_target: 1,
    xp_reward: 150,
  },
  {
    id: 'estudante_2',
    rank_id: 'estudante',
    position: 2,
    title: 'Foco em Linguagens',
    description: 'Resolva 30 questões de Linguagens.',
    goal_type: 'answer_questions',
    goal_target: 30,
    goal_filter: { discipline: 'linguagens' },
    xp_reward: 120,
  },
  {
    id: 'estudante_3',
    rank_id: 'estudante',
    position: 3,
    title: 'Foco em Humanas',
    description: 'Acerte 20 questões de Humanas.',
    goal_type: 'answer_correct',
    goal_target: 20,
    goal_filter: { discipline: 'humanas' },
    xp_reward: 140,
  },
  {
    id: 'estudante_4',
    rank_id: 'estudante',
    position: 4,
    title: 'Sequência de 7 dias',
    description: 'Estude 7 dias seguidos.',
    goal_type: 'reach_streak',
    goal_target: 7,
    xp_reward: 200,
    badge_reward: 'streak_7',
  },
  {
    id: 'estudante_5',
    rank_id: 'estudante',
    position: 5,
    title: 'Pausa lúdica',
    description: 'Jogue 1 partida em qualquer mini-game.',
    goal_type: 'play_game',
    goal_target: 1,
    xp_reward: 80,
  },

  // ---------------- ASPIRANTE (3500–7000) ----------------
  {
    id: 'aspirante_1',
    rank_id: 'aspirante',
    position: 1,
    title: 'Centena',
    description: 'Acumule 100 questões respondidas no total.',
    goal_type: 'answer_questions',
    goal_target: 100,
    xp_reward: 200,
  },
  {
    id: 'aspirante_2',
    rank_id: 'aspirante',
    position: 2,
    title: '50 acertos em Biologia',
    description: 'Acerte 50 questões de Biologia.',
    goal_type: 'answer_correct',
    goal_target: 50,
    goal_filter: { discipline: 'biologia' },
    xp_reward: 220,
  },
  {
    id: 'aspirante_3',
    rank_id: 'aspirante',
    position: 3,
    title: 'Domínio duplo',
    description: 'Conquiste 3 domínios de subtópico.',
    goal_type: 'master_subtopics',
    goal_target: 3,
    xp_reward: 250,
  },
  {
    id: 'aspirante_4',
    rank_id: 'aspirante',
    position: 4,
    title: 'Segundo simulado',
    description: 'Complete um segundo simulado.',
    goal_type: 'complete_simulado',
    goal_target: 2,
    xp_reward: 240,
  },
  {
    id: 'aspirante_5',
    rank_id: 'aspirante',
    position: 5,
    title: '60 minutos de foco',
    description: 'Acumule 60 minutos de Pomodoro hoje.',
    goal_type: 'focus_minutes',
    goal_target: 60,
    xp_reward: 200,
  },

  // ---------------- VESTIBULANDO (7000–15000) ----------------
  {
    id: 'vestibulando_1',
    rank_id: 'vestibulando',
    position: 1,
    title: 'Foco em Matemática',
    description: 'Acerte 75 questões de Matemática.',
    goal_type: 'answer_correct',
    goal_target: 75,
    goal_filter: { discipline: 'matematica' },
    xp_reward: 300,
  },
  {
    id: 'vestibulando_2',
    rank_id: 'vestibulando',
    position: 2,
    title: 'Sequência de 14 dias',
    description: 'Estude 14 dias seguidos sem falhar.',
    goal_type: 'reach_streak',
    goal_target: 14,
    xp_reward: 400,
  },
  {
    id: 'vestibulando_3',
    rank_id: 'vestibulando',
    position: 3,
    title: '5 domínios',
    description: 'Conquiste o domínio de 5 subtópicos.',
    goal_type: 'master_subtopics',
    goal_target: 5,
    xp_reward: 350,
  },
  {
    id: 'vestibulando_4',
    rank_id: 'vestibulando',
    position: 4,
    title: 'Foco em Física',
    description: 'Acerte 60 questões de Física.',
    goal_type: 'answer_correct',
    goal_target: 60,
    goal_filter: { discipline: 'fisica' },
    xp_reward: 300,
  },
  {
    id: 'vestibulando_5',
    rank_id: 'vestibulando',
    position: 5,
    title: 'Terceiro simulado',
    description: 'Complete 3 simulados.',
    goal_type: 'complete_simulado',
    goal_target: 3,
    xp_reward: 360,
  },

  // ---------------- EXPERT (15000–30000) ----------------
  {
    id: 'expert_1',
    rank_id: 'expert',
    position: 1,
    title: '300 questões',
    description: 'Acumule 300 questões respondidas no total.',
    goal_type: 'answer_questions',
    goal_target: 300,
    xp_reward: 500,
  },
  {
    id: 'expert_2',
    rank_id: 'expert',
    position: 2,
    title: '8 domínios',
    description: 'Conquiste 8 domínios de subtópicos.',
    goal_type: 'master_subtopics',
    goal_target: 8,
    xp_reward: 600,
  },
  {
    id: 'expert_3',
    rank_id: 'expert',
    position: 3,
    title: 'Sequência de 30 dias',
    description: 'Estude 30 dias seguidos.',
    goal_type: 'reach_streak',
    goal_target: 30,
    xp_reward: 800,
    badge_reward: 'streak_30',
  },
  {
    id: 'expert_4',
    rank_id: 'expert',
    position: 4,
    title: 'Foco em Química',
    description: 'Acerte 100 questões de Química.',
    goal_type: 'answer_correct',
    goal_target: 100,
    goal_filter: { discipline: 'quimica' },
    xp_reward: 550,
  },
  {
    id: 'expert_5',
    rank_id: 'expert',
    position: 5,
    title: 'Cinco simulados',
    description: 'Complete 5 simulados completos.',
    goal_type: 'complete_simulado',
    goal_target: 5,
    xp_reward: 700,
  },

  // ---------------- GÊNIO (30000–50000) ----------------
  {
    id: 'genio_1',
    rank_id: 'genio',
    position: 1,
    title: '500 questões',
    description: 'Acumule 500 questões respondidas no total.',
    goal_type: 'answer_questions',
    goal_target: 500,
    xp_reward: 800,
  },
  {
    id: 'genio_2',
    rank_id: 'genio',
    position: 2,
    title: '12 domínios',
    description: 'Conquiste 12 domínios de subtópicos.',
    goal_type: 'master_subtopics',
    goal_target: 12,
    xp_reward: 1000,
  },
  {
    id: 'genio_3',
    rank_id: 'genio',
    position: 3,
    title: 'Foco total em Linguagens',
    description: 'Acerte 120 questões de Linguagens.',
    goal_type: 'answer_correct',
    goal_target: 120,
    goal_filter: { discipline: 'linguagens' },
    xp_reward: 900,
  },
  {
    id: 'genio_4',
    rank_id: 'genio',
    position: 4,
    title: 'Sete simulados',
    description: 'Complete 7 simulados completos.',
    goal_type: 'complete_simulado',
    goal_target: 7,
    xp_reward: 1100,
  },
  {
    id: 'genio_5',
    rank_id: 'genio',
    position: 5,
    title: 'Sequência de 60 dias',
    description: 'Estude 60 dias seguidos.',
    goal_type: 'reach_streak',
    goal_target: 60,
    xp_reward: 1500,
  },

  // ---------------- APROVADO (50000+) ----------------
  {
    id: 'aprovado_1',
    rank_id: 'aprovado',
    position: 1,
    title: '1000 questões',
    description: 'Acumule 1000 questões respondidas. Volume cria mestres.',
    goal_type: 'answer_questions',
    goal_target: 1000,
    xp_reward: 1500,
  },
  {
    id: 'aprovado_2',
    rank_id: 'aprovado',
    position: 2,
    title: 'Polímata final',
    description: 'Conquiste 20 domínios de subtópicos.',
    goal_type: 'master_subtopics',
    goal_target: 20,
    xp_reward: 2000,
    badge_reward: 'polymath',
  },
  {
    id: 'aprovado_3',
    rank_id: 'aprovado',
    position: 3,
    title: 'Dez simulados',
    description: 'Complete 10 simulados completos.',
    goal_type: 'complete_simulado',
    goal_target: 10,
    xp_reward: 2200,
  },
  {
    id: 'aprovado_4',
    rank_id: 'aprovado',
    position: 4,
    title: 'Sequência de 100 dias',
    description: '100 dias seguidos. Lendário.',
    goal_type: 'reach_streak',
    goal_target: 100,
    xp_reward: 3000,
    badge_reward: 'streak_100',
  },
  {
    id: 'aprovado_5',
    rank_id: 'aprovado',
    position: 5,
    title: 'Aprovação',
    description: 'Acerte 500 questões em qualquer disciplina. Você está pronto.',
    goal_type: 'answer_correct',
    goal_target: 500,
    xp_reward: 3500,
  },
];

async function main(): Promise<void> {
  if (STATIONS.length !== 40) {
    throw new Error(`Spec exige 40 estações; encontrado ${STATIONS.length}`);
  }

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL ausente em .env.local');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const refMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (!refMatch) {
    throw new Error(`SUPABASE_DB_URL host inesperado: ${url.hostname}`);
  }
  const projectRef = refMatch[1];
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST ?? 'aws-1-us-east-2.pooler.supabase.com';
  const poolerUser = `postgres.${projectRef}`;

  const client = new Client({
    host: poolerHost,
    port: 5432,
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: poolerUser,
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`[gen:trilha] conectado ao pooler ${poolerHost}.`);

  let inserted = 0;
  let updated = 0;
  for (const s of STATIONS) {
    const filterJson = s.goal_filter ? JSON.stringify(s.goal_filter) : null;
    const res = await client.query(
      `insert into public.trilha_stations
         (id, rank_id, position, title, description, goal_type, goal_target,
          goal_filter, xp_reward, badge_reward)
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
       on conflict (id) do update set
         rank_id = excluded.rank_id,
         position = excluded.position,
         title = excluded.title,
         description = excluded.description,
         goal_type = excluded.goal_type,
         goal_target = excluded.goal_target,
         goal_filter = excluded.goal_filter,
         xp_reward = excluded.xp_reward,
         badge_reward = excluded.badge_reward
       returning (xmax = 0) as inserted`,
      [
        s.id,
        s.rank_id,
        s.position,
        s.title,
        s.description,
        s.goal_type,
        s.goal_target,
        filterJson,
        s.xp_reward,
        s.badge_reward ?? null,
      ],
    );
    const row = res.rows[0] as { inserted: boolean } | undefined;
    if (row?.inserted) {
      inserted++;
      console.log(`[gen:trilha] inserido ${s.id}`);
    } else {
      updated++;
    }
  }

  const countRes = await client.query<{ count: string }>(
    'select count(*)::text as count from public.trilha_stations',
  );
  const total = countRes.rows[0]?.count ?? '0';

  console.log(
    `[gen:trilha] done. inseridos=${inserted} atualizados=${updated} total=${total}`,
  );

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
