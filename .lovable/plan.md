

# Gap Analysis — Módulos Operações, Vendas/POS e Monitoria

## 1. Estado Actual vs. Especificação

### Módulo de Operações

| Sub-módulo | Estado | Notas |
|---|---|---|
| **Mecanização** (`/mecanizacao`) | **Não existe** | Sem página, sem dados, sem centros, sem ordens de serviço, sem validação satélite |
| **Técnicos de Campo** (`/tecnicos`) | **Não existe** | Sem página de listagem, sem ficha de detalhe, sem mapa de parcelas, sem atribuição em massa |
| **Produção** (`/producao`) | **Existe parcialmente** | Página existe com CRUD básico e dashboard, mas falta: recolha dual SMS+App, motor de regras agronómicas, campanhas com 10 fases, dashboard projetado vs real |

### Módulo Vendas & POS

| Sub-módulo | Estado | Notas |
|---|---|---|
| **POS** (`/pos`) | **Existe** | Fluxo 3 passos (identify → products → payment). Falta: passo "profile" com representantes, controlo de quotas por pacote, pagamento diferido mecanização |
| **Faturas** (`/faturas`) | **Existe** | Lista básica. Falta: séries fiscais CRUD, hash encadeado blockchain-like, tab auditoria |
| **Compras** (`/compras`) | **Existe** | Lista básica. Falta: aprovação com débito, link a ordens de mecanização |
| **Pacotes** (`/pacotes-compras`) | **Existe** | CRUD básico. Falta: geração automática por regra agronómica, pedidos de reforço |
| **WalletContext** | **Não existe** | Sem carteira digital, sem debit/credit, sem splitCredit |
| **ComprasContext** | **Não existe** | Sem contexto de compras, sem aprovação com débito |
| **PacotesContext** | **Não existe** | Sem contexto de pacotes, sem quota restante |

### Módulo de Monitoria

| Sub-módulo | Estado | Notas |
|---|---|---|
| **Alertas & Riscos** (`/alertas`) | **Não existe** | Ocorrências existem mas sem: interpretação SMS via IA, envio SMS por zona, notificação de fornecedores, mapa bidirecional |
| **Score Agrícola** (`/score-agricola`) | **Não existe** | Sem cálculo de conformidade, sem critérios (plantio/pacote/mecanização) |
| **NDVI Satélite** | **Não existe** | Sem edge function ndvi-fetch, sem gráfico temporal, sem painel de stress hídrico |
| **Seguros Agrícolas** (`/seguros`) | **Não existe como módulo dedicado** | Crédito & Seguro existe mas focado em perfis financeiros/crédito, não em apólices paramétricas, sinistros, regras NDVI |

---

## 2. Plano de Implementação (por prioridade)

Dada a dimensão (3 módulos completos, ~30+ ficheiros novos), proponho dividir em **4 fases**.

### Fase 1 — Mecanização Agrícola (Crítico: integra com POS)

**Novos ficheiros:**
- `src/pages/mechanization/MechanizationPage.tsx` — Página principal com tabs (Centros, Ordens, Gráficos)
- `src/components/mechanization/CentersList.tsx` — CRUD de centros com cascata província/município
- `src/components/mechanization/ServiceOrdersList.tsx` — Lista de ordens com máquina de estados
- `src/components/mechanization/SatelliteValidation.tsx` — Mapa Leaflet com desenho de polígonos + cálculo Shoelace
- `src/components/mechanization/MechanizationCharts.tsx` — KPIs e gráficos Recharts
- `src/hooks/useMechanization.ts` — Hook com dados mock iniciais

**Migration SQL:** Tabela `mechanization_centers`, `service_orders`, `mechanization_validation`

**Edições:** `App.tsx` (rotas), `Sidebar.tsx` (menu)

### Fase 2 — Técnicos de Campo

**Novos ficheiros:**
- `src/pages/technicians/TechniciansPage.tsx` — Listagem com painéis expansíveis
- `src/pages/technicians/TechnicianDetailPage.tsx` — Ficha com mapa Leaflet de parcelas
- `src/components/technicians/AssignFarmersDialog.tsx` — Atribuição em massa com checkboxes
- `src/components/technicians/TechnicianMap.tsx` — Mapa com polígonos reais de parcelas
- `src/hooks/useTechnicians.ts` — Hook com CRUD

**Migration SQL:** Tabela `field_technicians` + coluna `technician_id` em `farmers`

### Fase 3 — Monitoria (Alertas, Score, NDVI)

**Novos ficheiros:**
- `src/pages/monitoring/AlertsPage.tsx` — Alertas com mapa bidirecional, SMS recebidos/envio
- `src/pages/monitoring/AgriculturalScorePage.tsx` — Score de conformidade com KPIs e lista
- `src/components/monitoring/AlertMap.tsx` — Mapa Leaflet com marcadores por severidade
- `src/components/monitoring/SMSReceivedTab.tsx` — Interpretação SMS via IA (edge function)
- `src/components/monitoring/SMSSendTab.tsx` — Envio SMS por zona com templates
- `src/components/monitoring/NDVIChart.tsx` — Gráfico temporal ComposedChart
- `src/components/monitoring/NDVIPanel.tsx` — Painel stress hídrico para dashboard
- `src/hooks/useMonitoring.ts` — Hook para alertas e scores
- `supabase/functions/interpret-sms/index.ts` — Edge function com Lovable AI Gateway
- `supabase/functions/ndvi-fetch/index.ts` — Edge function NASA MODIS

**Migration SQL:** Tabelas `alerts`, `sms_received`, `sms_sent`, `agricultural_scores`

### Fase 4 — Seguros Agrícolas (módulo dedicado)

**Novos ficheiros:**
- `src/pages/insurance/InsurancePage.tsx` — Apólices, cotações, sinistros, regras, NDVI, auditoria (6 tabs)
- `src/components/insurance/InsuranceMap.tsx` — Mapa com polígonos de parcelas seguradas
- `src/components/insurance/ClaimForm.tsx` — Formulário de sinistro manual (fotos, GPS)
- `src/components/insurance/ParametricRules.tsx` — CRUD de regras paramétricas
- `src/hooks/useInsurance.ts` — Hook completo
- `supabase/functions/insurance-service/index.ts` — Edge function para cotações

**Migration SQL:** Tabelas `insurance_quote`, `insurance_policy`, `insurance_claim`, `parametric_rules`

---

## 3. Contextos em Falta (Transversal)

Os 3 contextos (`WalletContext`, `ComprasContext`, `PacotesContext`) descritos na especificação de Vendas/POS precisam de ser criados e integrados com o POS existente. Isto pode ser feito em paralelo com a Fase 1.

- `src/contexts/WalletContext.tsx` — Carteira digital com debit/credit/splitCredit
- `src/contexts/ComprasContext.tsx` — Gestão de compras com aprovação
- `src/contexts/PacotesContext.tsx` — Quotas por agricultor

---

## 4. Resumo

| Fase | Ficheiros Novos | Migrations | Estimativa |
|---|---|---|---|
| Fase 1 — Mecanização | ~6 | 1 | Alto |
| Fase 2 — Técnicos | ~5 | 1 | Médio |
| Fase 3 — Monitoria | ~9 + 2 edge functions | 1 | Alto |
| Fase 4 — Seguros | ~5 + 1 edge function | 1 | Alto |
| Contextos POS | ~3 | 0 | Médio |
| **Total** | **~28 ficheiros** | **4 migrations** | — |

Qual fase pretende implementar primeiro?

