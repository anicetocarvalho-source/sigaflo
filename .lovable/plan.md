## Objectivo

Substituir o ícone genérico `Leaf` (lucide) usado actualmente como marca SIGAFLO pelos logotipos oficiais anexados, em todas as superfícies do produto (portal público, app interna, autenticação, favicon, PWA, social).

## Inventário dos 5 ficheiros recebidos

| Ficheiro | Variante | Uso recomendado |
|---|---|---|
| `1.png` | Horizontal a cores (ícone + "SIGAFLO" + tagline + tira de pictogramas) | Header desktop largo, rodapé |
| `2.png` | Vertical/empilhada a cores | Splash, ecrã de login, cartões institucionais |
| `3.png` | Horizontal monocromática verde escuro | Documentos, e-mails, fundos claros institucionais |
| `4.png` | Vertical monocromática verde escuro | Versões impressas, exportações PDF |
| `icone.png` | Só o emblema circular (sem texto) | Favicon, ícones PWA, avatar, header mobile |

## Onde a marca aparece hoje (a substituir)

```text
src/components/public/PublicLayout.tsx   header + footer + dropdowns (3 × <Leaf />)
src/components/layout/Sidebar.tsx        marca da app interna (texto só, falta ícone)
src/pages/auth/AuthPage.tsx              split-screen login (2 × <Leaf />)
public/favicon.ico                       favicon antigo
public/icons/icon-192.png, icon-512.png  ícones PWA antigos
index.html                               sem og:image — passa a usar logo social
```

## Plano de execução

### 1. Importar e organizar assets

Copiar as 5 imagens para `src/assets/brand/` com nomes semânticos:

```text
src/assets/brand/
├── sigaflo-horizontal-color.png   (1.png)
├── sigaflo-stacked-color.png      (2.png)
├── sigaflo-horizontal-mono.png    (3.png)
├── sigaflo-stacked-mono.png       (4.png)
└── sigaflo-mark.png               (icone.png — só emblema)
```

E para `public/` (referenciados por HTML/manifest, não bundled):

```text
public/
├── favicon.png            (32×32 derivado de icone.png)
├── apple-touch-icon.png   (180×180 derivado de icone.png)
└── og-image.png           (1200×630, baseado no horizontal a cores)
```

### 2. Componente único `<BrandLogo>`

Criar `src/components/brand/BrandLogo.tsx` com API:

```tsx
<BrandLogo variant="horizontal" tone="color" className="h-10" />
<BrandLogo variant="stacked"    tone="mono"  />
<BrandLogo variant="mark"       /> {/* só emblema */}
```

Vantagens: um único ponto para futuras substituições; alt-text consistente ("SIGAFLO — Sistema Integrado de Gestão Agro-Florestal"); aspect-ratio garantido.

### 3. Substituir placements

| Local | Antes | Depois |
|---|---|---|
| Portal header (desktop) | caixa 36×36 com `<Leaf />` + texto | `<BrandLogo variant="horizontal" />` (~ h-10) |
| Portal header (mobile) | mesmo | `<BrandLogo variant="mark" className="h-9" />` |
| Portal footer | `<Leaf />` + texto | `<BrandLogo variant="horizontal" tone="mono" />` |
| Portal dropdown ícone | `<Leaf />` | manter `<Leaf />` (ícone funcional, não marca) |
| Sidebar app interna | só texto | `<BrandLogo variant="mark" />` + texto "SIGAFLO" |
| AuthPage (split-screen) | `<Leaf />` em caixa | `<BrandLogo variant="stacked" tone="color" />` no painel esquerdo, `<BrandLogo variant="mark" />` no painel direito |

### 4. Favicon, PWA e social

- Substituir `public/favicon.ico` por `public/favicon.png` (32×32 baseado em `icone.png`).
- Regenerar `public/icons/icon-192.png` e `icon-512.png` a partir de `icone.png` (mantendo padding interior para evitar corte em ícones maskable).
- Adicionar em `index.html`:
  - `<link rel="icon" href="/favicon.png" type="image/png" />`
  - `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`
  - `<meta property="og:image" content="https://sigaflo.lovable.app/og-image.png" />` (1200×630 com horizontal color centrado em fundo branco/verde institucional).

### 5. SeoHead — image fallback

`SeoHead` já aceita `image` por página. Adicionar fallback global para `/og-image.png` quando a página não passar imagem própria, garantindo que partilhas no LinkedIn/WhatsApp mostrem sempre o logo oficial.

## Notas técnicas

- Os PNGs anexados têm fundo transparente — funcionam sobre qualquer fundo.
- A tira de pictogramas dentro do logotipo horizontal é pequena demais para ler abaixo de h-10; em mobile (h-7/h-8) usar sempre `variant="mark"`.
- O Sidebar interno usa fundo escuro — usar `tone="color"` (o verde-claro do "FLO" mantém contraste) ou `mark` se o texto já existir.
- Não tocar em `<Leaf />` quando este é usado como **ícone funcional** de menu (ex.: item "Início" no portal) — só substituir nas 6 instâncias que representam a marca.

## Entregáveis

1. 5 ficheiros em `src/assets/brand/` + 3 em `public/`.
2. `src/components/brand/BrandLogo.tsx` (novo).
3. Edits em `PublicLayout.tsx`, `Sidebar.tsx`, `AuthPage.tsx`, `SeoHead.tsx`, `index.html`, `manifest.webmanifest`.
4. Memória `mem://ui/brand-logo-system` a documentar a regra "usar `<BrandLogo>`, nunca `<Leaf />` como marca".
