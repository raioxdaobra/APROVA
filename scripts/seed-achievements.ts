/**
 * Seed das 15 conquistas iniciais do APROVA na tabela public.achievements.
 *
 * Idempotente: usa `on conflict (id) do nothing`. Roda quantas vezes precisar.
 *
 * Uso: npm run gen:achievements
 *
 * Lê SUPABASE_DB_URL de .env.local (mesma estratégia de pooler IPv4 usada
 * em apply-migrations.ts).
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AchievementRarity } from '../src/lib/supabase/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

interface AchievementSeed {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
}

const ACHIEVEMENTS: readonly AchievementSeed[] = [
  // Onboarding / volume
  {
    id: 'first_q',
    title: 'Primeira questão',
    description: 'Você respondeu sua primeira questão. A jornada começou!',
    icon: 'Sparkles',
    rarity: 'common',
  },
  {
    id: 'marathon_50',
    title: 'Maratona',
    description: 'Respondeu 50 questões em um único dia.',
    icon: 'Zap',
    rarity: 'rare',
  },
  // Streaks
  {
    id: 'streak_7',
    title: 'Streak de 7 dias',
    description: '7 dias seguidos estudando. Hábito em construção.',
    icon: 'Flame',
    rarity: 'common',
  },
  {
    id: 'streak_30',
    title: 'Streak de 30 dias',
    description: '30 dias seguidos. Você é constante.',
    icon: 'Flame',
    rarity: 'rare',
  },
  {
    id: 'streak_100',
    title: 'Streak de 100 dias',
    description: '100 dias seguidos. Lendário.',
    icon: 'Flame',
    rarity: 'legendary',
  },
  // Domínios por disciplina
  {
    id: 'domain_mat',
    title: 'Domínio em Matemática',
    description: 'Conquistou seu primeiro domínio de subtópico em Matemática.',
    icon: 'Calculator',
    rarity: 'rare',
  },
  {
    id: 'domain_fis',
    title: 'Domínio em Física',
    description: 'Conquistou seu primeiro domínio de subtópico em Física.',
    icon: 'Atom',
    rarity: 'rare',
  },
  {
    id: 'domain_qui',
    title: 'Domínio em Química',
    description: 'Conquistou seu primeiro domínio de subtópico em Química.',
    icon: 'FlaskConical',
    rarity: 'rare',
  },
  {
    id: 'domain_bio',
    title: 'Domínio em Biologia',
    description: 'Conquistou seu primeiro domínio de subtópico em Biologia.',
    icon: 'Leaf',
    rarity: 'rare',
  },
  {
    id: 'domain_hum',
    title: 'Domínio em Humanas',
    description: 'Conquistou seu primeiro domínio de subtópico em Humanas.',
    icon: 'BookOpen',
    rarity: 'rare',
  },
  // Hábitos / horários
  {
    id: 'morning_owl',
    title: 'Madrugador',
    description: 'Respondeu uma questão antes das 7h da manhã.',
    icon: 'Sunrise',
    rarity: 'common',
  },
  {
    id: 'night_owl',
    title: 'Coruja',
    description: 'Respondeu uma questão depois das 23h.',
    icon: 'Moon',
    rarity: 'common',
  },
  {
    id: 'sunday_grinder',
    title: 'Sunday Grinder',
    description: '60 ou mais questões em um único domingo.',
    icon: 'Coffee',
    rarity: 'epic',
  },
  // Polimorfia / recovery
  {
    id: 'polymath',
    title: 'Polímata',
    description: 'Pelo menos 1 domínio em 5 disciplinas diferentes.',
    icon: 'Crown',
    rarity: 'epic',
  },
  {
    id: 'streak_recovery',
    title: 'Resiliente',
    description: 'Recuperou um streak quebrado 3 vezes.',
    icon: 'Heart',
    rarity: 'rare',
  },
];

async function main(): Promise<void> {
  if (ACHIEVEMENTS.length !== 15) {
    throw new Error(`Spec exige 15 badges; encontrado ${ACHIEVEMENTS.length}`);
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
  console.log(`[gen:achievements] conectado ao pooler ${poolerHost}.`);

  let inserted = 0;
  for (const a of ACHIEVEMENTS) {
    const res = await client.query(
      `insert into public.achievements (id, title, description, icon, rarity)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do nothing`,
      [a.id, a.title, a.description, a.icon, a.rarity]
    );
    if (res.rowCount && res.rowCount > 0) {
      inserted++;
      console.log(`[gen:achievements] inserido ${a.id}`);
    } else {
      console.log(`[gen:achievements] já existe ${a.id}`);
    }
  }

  const countRes = await client.query<{ count: string }>(
    'select count(*)::text as count from public.achievements'
  );
  const total = countRes.rows[0]?.count ?? '0';

  console.log(
    `[gen:achievements] done. inseridos=${inserted} total=${total}`
  );

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
