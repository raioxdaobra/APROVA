-- account_status com valores 'pending' | 'approved' | 'blocked'
alter table public.profiles
  add column if not exists account_status text not null default 'pending'
  check (account_status in ('pending', 'approved', 'blocked'));

-- usuários atuais (pré-feature) ficam aprovados pra não quebrar acesso
update public.profiles set account_status = 'approved' where account_status = 'pending';

-- index para listagem rápida de pendentes
create index if not exists idx_profiles_status on public.profiles (account_status);

-- RPC SECURITY DEFINER para admin aprovar/bloquear (evita RLS friction)
create or replace function public.admin_set_account_status(target_user_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  -- Só admin pode chamar
  select coalesce(is_admin, false) into caller_is_admin
  from public.profiles
  where id = auth.uid();

  if not caller_is_admin then
    raise exception 'Apenas admins podem alterar status de conta';
  end if;

  if new_status not in ('pending', 'approved', 'blocked') then
    raise exception 'Status inválido: %', new_status;
  end if;

  update public.profiles
  set account_status = new_status, updated_at = now()
  where id = target_user_id;
end;
$$;

revoke all on function public.admin_set_account_status(uuid, text) from public;
grant execute on function public.admin_set_account_status(uuid, text) to authenticated;

-- RPC para admin listar usuarios (com email do auth.users)
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  username text,
  account_status text,
  is_admin boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_is_admin boolean;
begin
  select coalesce(is_admin, false) into caller_is_admin
  from public.profiles
  where id = auth.uid();

  if not caller_is_admin then
    raise exception 'Apenas admins';
  end if;

  return query
    select p.id, u.email::text, p.display_name, p.username, p.account_status,
           coalesce(p.is_admin, false), p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by
      case p.account_status when 'pending' then 1 when 'approved' then 2 else 3 end,
      p.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;
