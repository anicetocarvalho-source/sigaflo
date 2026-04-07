

# Portal Público Agroflorestal de Angola — Transformação

## Objectivo
Transformar o portal `/verificar` de uma simples página de verificação de documentos num **hub informativo completo** do sector agroflorestal angolano, mantendo a verificação como uma das funcionalidades mas adicionando secções informativas, indicadores públicos, e navegação por sectores.

## Arquitectura de Páginas

```text
/portal                          → Homepage do Portal Público (novo)
/portal/agricultura              → Sector Agrícola (indicadores, culturas)
/portal/florestal                → Sector Florestal (concessões, reflorestamento)
/portal/cafe                     → Cadeia do Café (rastreio, qualidade)
/portal/arroz                    → Arroz Nacional (produção, importações)
/portal/verificar                → Verificação de Documentos (actual)
/portal/verificar/certificado    → (mantém)
/portal/verificar/licenca        → (mantém)
/portal/verificar/cafe           → (mantém)
/portal/verificar/scanner        → (mantém)
/portal/sobre                    → Sobre o SIGAFLO / Instituições
```

## Componentes a Criar

### 1. Layout do Portal Público (`src/components/public/PublicLayout.tsx`)
- Header fixo com logo SIGAFLO, menu de navegação horizontal (Início, Agricultura, Florestas, Café, Arroz, Verificação, Sobre)
- Menu mobile (hamburger → drawer)
- Footer institucional com logos MINAGRIP/INCA/IDF e links úteis

### 2. Homepage do Portal (`src/pages/public/PortalHome.tsx`)
- **Hero** com imagem de fundo agrícola, título "Portal Agroflorestal de Angola", barra de pesquisa
- **KPIs públicos** (4 cards): Total agricultores registados, Hectares cultivados, Certificados emitidos, Licenças florestais activas — dados reais via queries públicas (views seguras)
- **Sectores** (grid 4 cards): Agricultura, Florestas, Café, Arroz — com ícone, descrição curta, link
- **Últimas notícias/alertas**: Alertas climáticos activos (dados públicos da tabela `climate_occurrences` severidade critical/high)
- **Verificação rápida**: Manter a barra de pesquisa de documentos
- **Mapa de Angola**: Visualização simplificada das províncias com indicadores

### 3. Página Sectorial — Agricultura (`src/pages/public/PortalAgriculture.tsx`)
- Indicadores: agricultores por tipo, produção por cultura principal, distribuição provincial
- Charts públicos (bar/pie) com dados agregados
- Sem dados individuais (protegidos por RLS)

### 4. Página Sectorial — Florestas (`src/pages/public/PortalForestry.tsx`)
- Indicadores: concessões activas, licenças emitidas, área reflorestada, infracções
- Progresso do reflorestamento nacional

### 5. Página Sectorial — Café (`src/pages/public/PortalCoffee.tsx`)
- Indicadores: lotes por semaforização (verde/amarelo/vermelho), variedades, exportação
- Rastreio de lote público (link para verificação)

### 6. Página Sectorial — Arroz (`src/pages/public/PortalRice.tsx`)
- Indicadores: produção vs importação, preços médios, consumo per capita
- Gráfico de tendência de soberania alimentar

### 7. Página Sobre (`src/pages/public/PortalAbout.tsx`)
- Descrição do SIGAFLO, missão, instituições parceiras
- Contactos e links institucionais

## Dados Públicos (Segurança)
- Criar **views SQL públicas agregadas** para expor apenas totais/contagens — NUNCA dados individuais
- Views: `public_agriculture_stats`, `public_forestry_stats`, `public_coffee_stats`, `public_rice_stats`, `public_climate_alerts`
- RLS permite SELECT para `anon` nestas views apenas

## Alterações Técnicas

1. **Migration SQL**: Criar views públicas agregadas
2. **Hook `usePublicStats.ts`**: Queries anónimas (sem auth) para as views públicas
3. **Routing (`App.tsx`)**: Mover rotas `/verificar/*` para `/portal/*` (redirect de compatibilidade)
4. **Reutilização**: Charts (Recharts), Cards, design system existente

## Design
- Manter palette SIGAFLO (verde institucional, dourado accent)
- Header branco com menu horizontal, estilo portal governamental
- Secções alternadas (fundo branco / fundo muted)
- Responsive: mobile-first com menu hamburger
- Footer com brasão/logos institucionais

## Estimativa
- 8 novos ficheiros (layout + 6 páginas + hook)
- 1 migration SQL (views públicas)
- Alterações em `App.tsx` (novas rotas)

