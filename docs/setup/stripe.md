# Stripe — Paywall Pro (R$14,90/mês • R$119/ano)

Configuração de assinatura para o plano Pro do APROVA.

## Variáveis de ambiente (Vercel)

| Nome | Onde | Descrição |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server (Production + Preview) | `sk_live_...` ou `sk_test_...`. Sem essa env, o paywall abre em modo "Em breve" com botão Sair. |
| `STRIPE_WEBHOOK_SECRET` | Server (Production) | `whsec_...` — gerado no dashboard ao criar o endpoint. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Server + Client | `pk_live_...` ou `pk_test_...`. Apenas habilita UI; não é usada no checkout server-side. |
| `STRIPE_PRICE_MONTHLY` | Server | `price_...` da assinatura mensal R$14,90. |
| `STRIPE_PRICE_ANNUAL` | Server | `price_...` da assinatura anual R$119. |
| `NEXT_PUBLIC_APP_URL` | Server | `https://aprova.example.com` — usado em `success_url` / `cancel_url`. |

> Sem env Stripe → paywall mostra "Em breve. Contato: eng.arocha@gmail.com" e botão Sair.

## Setup no dashboard Stripe

1. **Produto Pro** em Products → New product:
   - Nome: `APROVA Pro`
   - Recurring monthly: BRL 14,90 → copie `price_id` para `STRIPE_PRICE_MONTHLY`.
   - Adicione segundo preço Recurring yearly: BRL 119,00 → copie para `STRIPE_PRICE_ANNUAL`.
2. **PIX** em Settings → Payment methods → habilitar PIX (Brasil). Stripe Checkout adiciona PIX automaticamente em subscriptions quando habilitado.
3. **Webhook** em Developers → Webhooks → Add endpoint:
   - URL: `https://<dominio>/api/stripe/webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copie `Signing secret` para `STRIPE_WEBHOOK_SECRET`.

## Limites do plano Free (lifetime, exceto chat)

- 30 questões totais (`profiles.questions_used_count`)
- 1 simulado total (`profiles.simulados_used_count`)
- 5 perguntas/dia no chat IA (compartilha `daily_chat_usage`)

Pro = ilimitado em todos os contadores.

## Fluxo

1. User atinge limite → `PaywallModal` abre via setup forms ou retorno 429 no chat.
2. User escolhe plano → POST `/api/stripe/checkout` cria Checkout Session.
3. Stripe redireciona para `/billing/sucesso?session_id=...` (success) ou `/billing/cancelado`.
4. Webhook `/api/stripe/webhook` recebe `checkout.session.completed`:
   - Upsert em `subscriptions` (status, customer_id, subscription_id, current_period_end).
   - Update em `profiles` → `plan='pro'`, `plan_expires_at = current_period_end`.
5. Cancelamento (`customer.subscription.deleted`) → `plan='free'`, `plan_expires_at=null`.

## Teste local

```bash
# 1. Listen
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# stripe imprime whsec_... — coloque em .env.local como STRIPE_WEBHOOK_SECRET

# 2. Trigger evento
stripe trigger checkout.session.completed
```

## Não-objetivos

- Trial gratuito (sem trial — free tier é o trial).
- Múltiplos planos além de mensal/anual.
- Cupons/descontos custom (Stripe Promotion Codes está habilitado via `allow_promotion_codes`).
- Cobrança manual ou faturas customizadas.
