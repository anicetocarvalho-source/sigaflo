

# Portal Nacional Agroflorestal de Angola (PNAA) — Plano de Transformação

## Estado Actual
O portal `/portal` já possui: homepage com KPIs, 4 páginas sectoriais (Agricultura, Florestas, Café, Arroz), verificação de documentos (certificados, licenças, café), e página Sobre. Todas as páginas consomem dados reais via views SQL públicas.

## O Que Falta (Gap Analysis)

O pedido define 8 módulos core. Mapeamento do que **existe vs. falta**:

| Módulo | Existe | Falta |
|---|---|---|
| 1. Portal Público (homepage) | ✅ Parcial | Indicadores & Estatísticas, Legislação, Notícias, FAQ, Contactos, Mapa interactivo |
| 2. Verificação de Documentos | ✅ Completo | Histórico de verificações, melhorias visuais |
| 3. Certificação & Registo | ✅ (backoffice) | Página pública de consulta de registos (produtores, cooperativas, exportadores) |
| 4. Indicadores & Inteligência | ⚠️ Básico | Dashboard público de indicadores com filtros (província, ano, cultura), export CSV/PDF |
| 5. Mapas Interactivos | ❌ | Mapa público de Angola com layers (culturas, florestas, produção) |
| 6. Motor de Legislação | ❌ | Tabela `legislation`, página pesquisável, filtros, download PDF |
| 7. Serviços Digitais (auth) | ❌ | Submissão de documentos, tracking de pedidos, timeline |
| 8. Admin Backoffice (CMS) | ❌ | Gestão de conteúdos (notícias, páginas, documentos legislativos) |

## Estratégia de Implementação

Dado o volume, proponho **3 fases** implementadas sequencialmente. A primeira fase transforma o portal num hub informativo completo. As fases seguintes adicionam serviços digitais e CMS.

---

### FASE 1 — Hub Informativo Nacional (esta implementação)

**1.1 — Navegação expandida do portal**
- Adicionar ao header: Indicadores, Legislação, Notícias, Mapas, FAQ, Contactos
- Mega-menu dropdown para Sectores (Agricultura, Florestas, Café, Arroz)
- Redesign do header para comportar mais itens (estilo portal governamental)

**1.2 — Homepage premium redesenhada**
- Hero com animação subtil e branding institucional forte
- Barra de pesquisa global (documentos + legislação + notícias)
- 6 KPIs principais (adicionar exportações e preço médio)
- Secção "Serviços Rápidos" (verificação, consulta registos, legislação)
- Secção "Últimas Notícias" (3-4 cards)
- Secção "Legislação Recente" (3 itens)
- Secção "Mapa de Angola" (preview estático com link para mapa completo)
- Parceiros institucionais (MINAGRIP, INCA, IDF, INCER, INE, INAMET)

**1.3 — Página de Indicadores & Estatísticas (`/portal/indicadores`)**
- Dashboard público completo com:
  - Filtros: província, ano, cultura
  - Charts: produção por cultura, área cultivada, tendências anuais
  - Tabela resumo exportável (CSV)
- Dados via views públicas existentes + novas views para séries temporais

**1.4 — Motor de Legislação (`/portal/legislacao`)**
- Migration: tabela `legislation` (title, type, sector, date, summary, pdf_url, published)
- Página com pesquisa, filtros (tipo, sector, data), listagem paginada
- Página de detalhe com leitura limpa e download

**1.5 — Página de Notícias (`/portal/noticias`)**
- Migration: tabela `portal_news` (title, excerpt, content, image_url, category, published_at, author_id)
- Listagem com cards, filtros por categoria
- Página de detalhe de notícia

**1.6 — Mapa Público Interactivo (`/portal/mapa`)**
- Mapa de Angola via Mapbox (token já configurado via edge function)
- Layers: províncias com indicadores, culturas principais, zonas florestais
- Popup com stats por província

**1.7 — FAQ e Contactos**
- `/portal/faq` — Accordion com perguntas frequentes por categoria
- `/portal/contactos` — Formulário de contacto + dados das instituições

**1.8 — Consulta Pública de Registos (`/portal/registos`)**
- Pesquisa pública de produtores/cooperativas por número de registo
- Mostra apenas dados não-sensíveis (nome, tipo, província, status, data de registo)
- View SQL pública dedicada (`public_farmer_registry`)

### Alterações Técnicas (Fase 1)

**Migrations SQL:**
1. Tabela `legislation` com campos: id, title, type (enum: decree, law, notice, regulation), sector, published_date, summary, content, pdf_url, is_published, created_by
2. Tabela `portal_news` com campos: id, title, excerpt, content, image_url, category, published_at, is_published, created_by
3. View `public_farmer_registry` (nome, tipo, província, status — sem PII)
4. View `public_indicators_by_year` (séries temporais agregadas)
5. RLS: anon SELECT em views; admin INSERT/UPDATE nas tabelas

**Novos ficheiros (~14):**
- `src/pages/public/PortalIndicators.tsx`
- `src/pages/public/PortalLegislation.tsx`
- `src/pages/public/PortalLegislationDetail.tsx`
- `src/pages/public/PortalNews.tsx`
- `src/pages/public/PortalNewsDetail.tsx`
- `src/pages/public/PortalMap.tsx`
- `src/pages/public/PortalFAQ.tsx`
- `src/pages/public/PortalContacts.tsx`
- `src/pages/public/PortalRegistry.tsx`
- `src/hooks/usePublicLegislation.ts`
- `src/hooks/usePublicNews.ts`
- `src/hooks/usePublicRegistry.ts`
- Actualização: `PublicLayout.tsx` (mega-menu)
- Actualização: `PortalHome.tsx` (redesign completo)
- Actualização: `App.tsx` (novas rotas)

---

### FASE 2 — Serviços Digitais (futura)
- Portal autenticado para produtores/exportadores
- Submissão e tracking de pedidos de certificação
- Timeline de estado do pedido
- Notificações por email

### FASE 3 — CMS & Backoffice (futura)
- Interface admin para gerir notícias, legislação, páginas
- Workflow de aprovação/publicação
- Gestão de conteúdos do portal

---

## Resumo da Fase 1

| Item | Ficheiros | Esforço |
|---|---|---|
| Header mega-menu | 1 | Médio |
| Homepage redesign | 1 | Alto |
| Indicadores | 2 | Alto |
| Legislação | 3 + migration | Alto |
| Notícias | 3 + migration | Médio |
| Mapa público | 1 | Médio |
| FAQ + Contactos | 2 | Baixo |
| Registo público | 2 + view | Médio |
| Rotas | 1 | Baixo |

**Total: ~14 ficheiros novos, 3 actualizados, 2 migrations SQL**

Devo implementar a **Fase 1 completa** agora?

