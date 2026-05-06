# APROVA — Identidade Visual

Sources of truth pros assets de marca. **NÃO edite os PNGs em `public/icons/` direto** — eles são gerados via `npm run icons` a partir dos SVGs aqui.

## Conceito

Letra **A** geométrica com **checkmark integrado** no espaço do crossbar tradicional. Comunica "aprovação" instantaneamente. Funciona de 16px (favicon) até 1024px (splash) sem perder reconhecibilidade.

## Cores

| Token        | HEX        | Uso                                            |
| ------------ | ---------- | ---------------------------------------------- |
| Cobre primário | `#C4633B` | Background do badge, A em fundo claro          |
| Cobre dark     | `#8F4528` | Gradiente, hover states                        |
| Cobre light    | `#E08A5E` | Gradiente, splash screens                      |
| Slate 900      | `#0F172A` | Wordmark, mono em fundos claros                |
| Branco         | `#FFFFFF` | Mark sobre cobre, fundos escuros               |
| Off-white      | `#FFF8F4` | Background claro alternativo                   |

`theme_color` do PWA: `#C4633B` (não mexer — quebra continuidade visual).

## Variantes

### 1. `aprova-logo.svg` (320×96)
Símbolo + wordmark "APROVA". Usar em headers, marketing, integrações tipo Mercado Pago.

### 2. `aprova-icon.svg` (256×256)
Apenas o símbolo (badge cobre + A branco com check). É a **fonte canônica** dos PNGs em `public/icons/`. Apple Touch Icon, favicon, app icon, social cards.

### 3. `aprova-icon-mono.svg` (256×256)
Versão monocromática usando `currentColor`. Stamp em qualquer cor via CSS. Fallback default: slate-900. Usar em documentos, prints, e-mails.

### 4. `aprova-icon-maskable.svg` (256×256)
Full-bleed pra PWA Android (Maskable Icon spec). Conteúdo dentro de safe area 80%. **Nunca usar em UI** — apenas pro manifest.

## Espaçamento mínimo (clear space)

Em torno do logo principal, manter clear space igual à altura da letra "A" do wordmark (≈44px no SVG nominal). Em torno do símbolo solo, manter clear space igual a 1/4 da largura do badge (≈64px num icon de 256px).

## Uso correto

- Sobre fundos claros: usar `aprova-logo.svg` (wordmark slate, símbolo cobre).
- Sobre fundos escuros: usar `aprova-icon-mono.svg` com `color: white` via CSS.
- App icon, favicon, PWA, social: `aprova-icon.svg`.
- Imagens promocionais com background colorido: priorizar a variante full (badge cobre).

## Uso incorreto

- ❌ Não recolorir o badge cobre pra outras cores
- ❌ Não esticar/distorcer (manter aspect ratio 1:1 do símbolo, 10:3 do logo completo)
- ❌ Não substituir a tipografia do wordmark (Inter / system-ui bold)
- ❌ Não adicionar shadows, outlines ou efeitos extras
- ❌ Não usar a versão maskable em UI normal (é só pra Android crop)

## URLs públicas

Após o deploy automático para produção (Vercel), os ativos ficam disponíveis em:

- App Icon (512×512): `https://aprova-five.vercel.app/icons/icon-512.png`
- App Icon (1024×1024): `https://aprova-five.vercel.app/icons/icon-1024.png`
- Apple Touch Icon (180×180): `https://aprova-five.vercel.app/icons/apple-touch-icon.png`
- Favicon (32×32): `https://aprova-five.vercel.app/icons/favicon-32.png`
- Logo SVG: `https://aprova-five.vercel.app/brand/aprova-logo.svg`

**Use o icon-512 pra integrações tipo Mercado Pago** (logo do checkout, marketplace badge, etc).

## Pipeline

Pra regenerar todos os PNGs após editar SVGs:

```bash
npm run icons
```

Output:
- `public/icons/icon-{192,512,1024}.png` — app icons
- `public/icons/icon-maskable-512.png` — PWA Android
- `public/icons/apple-touch-icon.png` — iOS Home Screen
- `public/icons/favicon-{16,32}.png` — browser tabs
- `public/icons/splash-iphone-*.png` — iOS splash screens
- `public/favicon.ico` — multi-size legacy favicon (16+32+48)
