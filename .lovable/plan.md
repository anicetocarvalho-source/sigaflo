
# Portal Visualmente Atractivo — Imagens, Slides e Galeria

Manter a paleta **Verde Institucional** actual (`#0a4d2e`, `#1a7f4f`, `#d4a84b`, `#f5f0e0`) e a identidade SIGAFLO. Acrescentar fotografia, carrosséis e uma nova página de Multimédia.

---

## 1. Geração de imagens (IA — Nano Banana)

Criar um banco fotográfico institucional em `src/assets/portal/` com cenas autênticas de Angola (sem texto sobreposto, formato 16:9 paisagem, 21:9 para heroes):

**Heroes principais (5 imagens, 21:9):**
- `hero-fields.jpg` — campos de cultivo no planalto angolano ao amanhecer
- `hero-coffee.jpg` — plantação de café arábica com baga vermelha em close
- `hero-forest.jpg` — floresta de miombo com luz filtrada
- `hero-rice.jpg` — campos alagados de arroz com agricultora
- `hero-farmer.jpg` — agricultor angolano com ferramentas no campo

**Sectores (4 imagens, 16:9):** `sector-agricultura.jpg`, `sector-florestas.jpg`, `sector-cafe.jpg`, `sector-arroz.jpg`

**Galeria geral (8 imagens, 4:3/3:2):** mercados rurais, cooperativas, técnicos de campo, mecanização, transporte de madeira licenciada, secagem de café, viveiros de reflorestamento, mulher agricultora.

**Sobre/Contactos (2 imagens, 16:9):** edifício institucional MINAGRIP, equipa de técnicos.

Total: ~19 imagens geradas via `imagegen--generate_image` (model `standard`).

---

## 2. Componente reutilizável: HeroCarousel

Novo `src/components/public/HeroCarousel.tsx`:
- Baseado no `Carousel` shadcn (já disponível) + autoplay (3s/slide com pausa no hover)
- Slides full-bleed com imagem de fundo, gradiente verde sobreposto (`from-primary/85 via-primary/60 to-transparent`)
- Cada slide: título grande, subtítulo, CTA, badge de sector
- Indicadores (dots) e setas, navegação por teclado
- Altura responsiva: `h-[60vh] min-h-[480px]` desktop, `h-[55vh]` mobile
- Mantém a barra de pesquisa de verificação sobreposta na base

---

## 3. Componente reutilizável: ContentCarousel

Novo `src/components/public/ContentCarousel.tsx`:
- Carrossel horizontal de cards com setas (1→3 cards visíveis conforme breakpoint)
- Usado para: notícias em destaque, legislação recente, galeria de projectos
- Snap-scroll no mobile, setas no desktop

---

## 4. Componente: ImageGallery (lightbox)

Novo `src/components/public/ImageGallery.tsx`:
- Grid masonry responsivo (2/3/4 colunas)
- Click → lightbox via Dialog do shadcn
- Hover: zoom suave + legenda fade-in
- Lazy loading nativo (`loading="lazy"`)

---

## 5. Página Home (`PortalHome.tsx`) — redesenho

Substituir a hero actual por:

```text
[ HeroCarousel 5 slides full-bleed ]
   ├─ slide 1: "Portal Nacional Agroflorestal" + pesquisa
   ├─ slide 2: "Café de Angola" → /portal/cafe
   ├─ slide 3: "Florestas Sustentáveis" → /portal/florestal
   ├─ slide 4: "Soberania do Arroz" → /portal/arroz
   └─ slide 5: "Verifique Documentos" → /portal/verificar

[ KPIs sobrepostos ao carrossel (-mt-12) ]

[ Serviços Rápidos — manter mas em cards com gradient hover ]

[ Sectores — adicionar imagem de fundo a cada card (sector-*.jpg) ]
   Card com overlay verde, imagem visível ao hover

[ Galeria em destaque (8 fotos) — ContentCarousel ]
   "Angola Agroflorestal em Imagens" → CTA para /portal/galeria

[ Notícias + Legislação — manter, com thumbnails maiores ]

[ Faixa de Impacto — fundo hero-farmer.jpg + estatísticas grandes ]

[ Verificação + Parceiros — manter ]
```

---

## 6. Páginas dos 4 Sectores — header visual

Cada uma (Agricultura, Florestas, Café, Arroz) recebe:
- **Hero banner** 21:9 com imagem dedicada + overlay verde + título e breadcrumb
- **Mini-galeria** de 4–6 imagens relevantes ao sector (ContentCarousel)
- KPIs e conteúdo existente preservados abaixo

---

## 7. Páginas Sobre / Contactos — toques visuais

- `PortalAbout.tsx`: hero com `hero-farmer.jpg`, foto institucional na secção de instituições parceiras, divisores visuais.
- `PortalContacts.tsx`: hero com edifício MINAGRIP.

---

## 8. Nova página: Galeria/Multimédia

Rota: `/portal/galeria` → `src/pages/public/PortalGallery.tsx`

Estrutura:
- Hero compacto "Multimédia & Galeria"
- Filtros por categoria (Agricultura, Florestas, Café, Arroz, Comunidades)
- Grid masonry com `ImageGallery` + lightbox
- Secção "Em destaque" com 3 fotos grandes
- Placeholder para vídeos institucionais (cards com thumbnail e botão play — sem player real nesta iteração)

Adicionar entrada no menu (`PublicLayout.tsx` → `infoItems`) e no rodapé.

---

## 9. Detalhes técnicos

- **Imagens importadas como ES6**: `import heroFields from '@/assets/portal/hero-fields.jpg'` (não usar paths string para tirar partido do build do Vite e hashing).
- **Acessibilidade**: alt-text descritivo em PT-AO em todas as imagens; `aria-label` nos controles do carrossel; respeitar `prefers-reduced-motion` para desactivar autoplay.
- **Performance**: `loading="lazy"` excepto na primeira slide do hero; `decoding="async"`.
- **SEO**: tags `<meta>` Open Graph na Home com `hero-fields.jpg`.
- **Sem alteração de backend** — apenas frontend e assets.

---

## Ficheiros afectados

**Novos:**
- `src/assets/portal/*.jpg` (≈19 imagens)
- `src/components/public/HeroCarousel.tsx`
- `src/components/public/ContentCarousel.tsx`
- `src/components/public/ImageGallery.tsx`
- `src/pages/public/PortalGallery.tsx`

**Editados:**
- `src/pages/public/PortalHome.tsx`
- `src/pages/public/PortalAgriculture.tsx`
- `src/pages/public/PortalForestry.tsx`
- `src/pages/public/PortalCoffee.tsx`
- `src/pages/public/PortalRice.tsx`
- `src/pages/public/PortalAbout.tsx`
- `src/pages/public/PortalContacts.tsx`
- `src/components/public/PublicLayout.tsx` (entrada Galeria)
- `src/App.tsx` (rota `/portal/galeria`)
