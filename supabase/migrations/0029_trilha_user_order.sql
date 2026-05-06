-- =============================================================================
-- 0029_trilha_user_order.sql
--
-- PR 27 — Caminhos paralelos personalizáveis. Cada user pode escolher a ordem
-- dos ranks 2, 3, 4, 5 da trilha. Ranks 1, 6, 7, 8 ficam fixos.
--
-- Tabela: user_trilha_order com 4 picks que devem ser permutação distinta de
-- {2, 3, 4, 5}. Trigger valida unicidade no insert/update.
--
-- RLS: cada user lê e escreve apenas o próprio registro.
-- =============================================================================

create table if not exists public.user_trilha_order (
  user_id uuid references auth.users(id) on delete cascade primary key,
  rank_2_pick int not null default 2 check (rank_2_pick between 2 and 5),
  rank_3_pick int not null default 3 check (rank_3_pick between 2 and 5),
  rank_4_pick int not null default 4 check (rank_4_pick between 2 and 5),
  rank_5_pick int not null default 5 check (rank_5_pick between 2 and 5),
  updated_at timestamptz not null default now(),
  -- Permutação distinta: 4 picks distintos.
  constraint user_trilha_order_picks_distinct check (
    rank_2_pick <> rank_3_pick
    and rank_2_pick <> rank_4_pick
    and rank_2_pick <> rank_5_pick
    and rank_3_pick <> rank_4_pick
    and rank_3_pick <> rank_5_pick
    and rank_4_pick <> rank_5_pick
  )
);

alter table public.user_trilha_order enable row level security;

drop policy if exists "user reads own trilha order" on public.user_trilha_order;
create policy "user reads own trilha order" on public.user_trilha_order
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "user upserts own trilha order" on public.user_trilha_order;
create policy "user upserts own trilha order" on public.user_trilha_order
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.user_trilha_order is
  'PR 27 — Ordem customizada dos ranks intermediários (2-5) da trilha por user.';
