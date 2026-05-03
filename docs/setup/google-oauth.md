# Google OAuth — Setup manual

O botão "Entrar com Google" na landing já está implementado. Para ativá-lo em produção, você precisa criar credenciais OAuth no Google Cloud Console e colar no Supabase. Sem isso, clicar no botão redireciona pra `/?error=oauth_unavailable` (UX gracioso, não quebra).

Tempo estimado: 5–10 minutos. Sem custo. Sem cartão.

## 1. Google Cloud Console — criar credenciais

1. Abra https://console.cloud.google.com/apis/credentials.
2. Selecione (ou crie) um projeto. Nome sugerido: `APROVA`.
3. Se for projeto novo, primeiro configure a tela de consentimento:
   - Menu lateral → **OAuth consent screen** → **External** → preencher nome do app (`APROVA`), email de suporte e email do desenvolvedor (eng.arocha@gmail.com).
   - Em "Scopes" pode pular (manter padrão `email`, `profile`, `openid`).
   - Em "Test users" adicione seu email se vai testar antes de publicar.
   - Salvar e voltar pra Credentials.
4. **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `APROVA — Production`.
   - **Authorized JavaScript origins**:
     - `https://aprova-five.vercel.app`
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://udajthekofnfewuxxdcq.supabase.co/auth/v1/callback`
5. Clicar **CREATE** → copiar **Client ID** e **Client secret**.

## 2. Supabase Dashboard — habilitar provedor

1. Abra https://supabase.com/dashboard/project/udajthekofnfewuxxdcq/auth/providers.
2. Localizar **Google** na lista → clicar **Enable**.
3. Colar o **Client ID** e **Client Secret** copiados.
4. **Redirect URL** já vem preenchida com `https://udajthekofnfewuxxdcq.supabase.co/auth/v1/callback` — confirme que bate com o que você colocou no Google Console.
5. **Save**.

## 3. Site URL e Redirect URLs no Supabase

No mesmo dashboard, em **Authentication → URL Configuration**:

- **Site URL**: `https://aprova-five.vercel.app`
- **Redirect URLs** (adicione todas):
  - `https://aprova-five.vercel.app/**`
  - `http://localhost:3000/**`

Salvar.

## 4. Validar

1. Em produção, abra https://aprova-five.vercel.app em janela anônima.
2. Click "Entrar com Google".
3. Deve aparecer a tela de consentimento do Google.
4. Após aprovar, é redirecionado para `/auth/callback` → onboarding (perfil) ou dashboard (se já completou).

Se vier o erro `oauth_unavailable`, algum dos passos acima ficou faltando. Os mais comuns: Redirect URI não bate, ou Client Secret colado errado no Supabase.

## Rollback

Caso queira desativar o Google enquanto investiga: Supabase Dashboard → Auth → Providers → Google → Disable. O botão na landing automaticamente cai no caminho de fallback (`oauth_unavailable`).
