-- =============================================================================
-- 0021_admin_fixes.sql
--
-- Fix: column reference "is_admin" was ambiguous em admin_list_users porque o
-- OUT param colide com profiles.is_admin. Solução: pragma `#variable_conflict
-- use_column` (mesmo truque do 0010) e qualificação explícita das referências
-- em SELECT INTO.
-- =============================================================================

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
#variable_conflict use_column
declare
  caller_is_admin boolean;
begin
  select coalesce(p.is_admin, false) into caller_is_admin
  from public.profiles p
  where p.id = auth.uid();

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

-- Mesmo fix em admin_set_account_status pra defensive consistency
create or replace function public.admin_set_account_status(target_user_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  caller_is_admin boolean;
begin
  select coalesce(p.is_admin, false) into caller_is_admin
  from public.profiles p
  where p.id = auth.uid();

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
