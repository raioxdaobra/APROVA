# PR 12 Execution Plan

Spec: `docs/superpowers/specs/2026-05-03-pr12-ai-helper-and-gamification-design.md`

Estratégia: **4 subagents em paralelo via worktree isolada**, cada um responsável por um bloco coeso de arquivos. Coordenador (controller) faz merge sequencial após todos terminarem.

| Worktree | Responsabilidade | Arquivos principais |
|---|---|---|
| **A — Schema + scripts offline** | Migrations 0012-0015, scripts `generate-solutions.ts` e `generate-theory.ts`, types, seed achievements | `supabase/migrations/{0012,0013,0014,0015}*.sql`, `scripts/generate-*.ts`, `src/lib/supabase/types.ts` |
| **B — LLM + chat** | `src/lib/llm/*`, `src/app/api/chat/*`, `src/components/question-chat.tsx`, `src/components/solution-panel.tsx`, `src/components/theory-panel.tsx` | módulo IA cliente+servidor, KaTeX render |
| **C — Gamificação** | `src/lib/{achievements,missions,audio}/*`, componentes celebratórios, integração com triggers de XP | badges, sons, ranks, missões, animações |
| **D — UX polish** | Atalhos teclado, chip dificuldade, countdown, share OG, pomodoro, integração nas telas existentes | enhance quiz/simulado/dashboard |

**Boundaries:** worktrees A, B, C, D só tocam nos próprios arquivos. Quando há conflito previsível (ex.: B e D ambos editam `quiz/sessao/[id]/page.tsx`), B faz a integração de chat e D faz a integração de atalhos — ordem de merge: A → B → C → D, conflitos resolvidos pelo controller.

**Validação por worktree:** typecheck + lint + build + commit. Sem deploy.

**Após todos:** controller mergeia sequencialmente, roda `npm run db:push` para aplicar as 4 migrations, roda os scripts offline (`npm run gen:solutions`, `npm run gen:theory`, `npm run gen:achievements`), valida count, build, deploy.
