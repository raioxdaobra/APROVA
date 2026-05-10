import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { approveUser, blockUser, unblockUser } from './actions';
import { InviteForm } from './_components/invite-form';
import { ResetStatsButton } from './_components/reset-stats-button';

export const metadata = {
  title: 'Admin · Usuários — APROVA',
};

export const dynamic = 'force-dynamic';

type AdminUserRow = {
  id: string;
  email: string;
  display_name: string;
  username: string;
  account_status: string;
  is_admin: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  blocked: 'Bloqueado',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  approved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  blocked: 'bg-zinc-200 text-zinc-700 border-zinc-300',
};

const STATUS_ROW_BG: Record<string, string> = {
  pending: 'bg-amber-50/60',
  approved: '',
  blocked: 'bg-zinc-50/60 opacity-90',
};

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  const { data: users, error } = await supabase.rpc('admin_list_users');
  const list = ((users ?? []) as AdminUserRow[]) ?? [];

  // Estatisticas agregadas por user_id — duas queries leves (count com
  // index em user_id e baratas). Permite mostrar #attempts e #sessions
  // por linha sem N+1.
  const attemptsByUser = new Map<string, number>();
  const sessionsByUser = new Map<string, number>();
  if (list.length > 0) {
    const userIds = list.map((u) => u.id);

    const { data: attemptsAgg } = await supabase
      .from('attempts')
      .select('user_id')
      .in('user_id', userIds);
    for (const row of (attemptsAgg ?? []) as Array<{ user_id: string }>) {
      attemptsByUser.set(row.user_id, (attemptsByUser.get(row.user_id) ?? 0) + 1);
    }

    const { data: sessionsAgg } = await supabase
      .from('study_sessions')
      .select('user_id')
      .in('user_id', userIds);
    for (const row of (sessionsAgg ?? []) as Array<{ user_id: string }>) {
      sessionsByUser.set(row.user_id, (sessionsByUser.get(row.user_id) ?? 0) + 1);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Admin · Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            Aprove novos cadastros e gerencie acessos.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard">Voltar</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16">
        <section className="mb-6 rounded-lg border border-border bg-card p-4">
          <InviteForm />
        </section>

        {error ? (
          <p className="text-sm text-destructive">Erro ao carregar usuários: {error.message}</p>
        ) : null}

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Admin?</th>
                <th className="px-3 py-2">Stats</th>
                <th className="px-3 py-2">Criado em</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                list.map((u) => {
                  const status = u.account_status ?? 'pending';
                  return (
                    <tr
                      key={u.id}
                      className={`border-t border-border ${STATUS_ROW_BG[status] ?? ''}`}
                    >
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.display_name ?? '-'}</td>
                      <td className="px-3 py-2">{u.username ?? '-'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            STATUS_BADGE[status] ?? ''
                          }`}
                        >
                          {STATUS_LABEL[status] ?? status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{u.is_admin ? 'Sim' : '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col text-xs leading-tight">
                          <span>
                            <strong className="tabular-nums text-foreground">
                              {attemptsByUser.get(u.id) ?? 0}
                            </strong>{' '}
                            <span className="text-muted-foreground">tentativas</span>
                          </span>
                          <span>
                            <strong className="tabular-nums text-foreground">
                              {sessionsByUser.get(u.id) ?? 0}
                            </strong>{' '}
                            <span className="text-muted-foreground">sessões</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">{formatDate(u.created_at)}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {status === 'pending' ? (
                            <form
                              action={async () => {
                                'use server';
                                await approveUser(u.id);
                              }}
                            >
                              <Button type="submit" size="sm" variant="primary">
                                Aprovar
                              </Button>
                            </form>
                          ) : null}
                          {status === 'blocked' ? (
                            <form
                              action={async () => {
                                'use server';
                                await unblockUser(u.id);
                              }}
                            >
                              <Button type="submit" size="sm" variant="secondary">
                                Reativar
                              </Button>
                            </form>
                          ) : null}
                          {status !== 'blocked' ? (
                            <form
                              action={async () => {
                                'use server';
                                await blockUser(u.id);
                              }}
                            >
                              <Button type="submit" size="sm" variant="destructive">
                                Bloquear
                              </Button>
                            </form>
                          ) : null}
                          <ResetStatsButton
                            userId={u.id}
                            userLabel={u.display_name || u.username || u.email}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
