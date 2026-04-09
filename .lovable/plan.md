

# Auditoria de Conexões Inter-Módulos — Análise Completa

## Metodologia
Análise módulo a módulo verificando: (1) se os dados cruzam entre módulos, (2) se existem links de navegação bidireccional, (3) se os hooks consomem tabelas de outros módulos.

---

## 1. Módulo Agricultores ✅ Parcialmente conectado

**Conexões existentes:**
- Produção (`production_history.farmer_id`) → lê dados no perfil
- Certificados (`agricultural_certificates.farmer_id`) → tab no perfil
- POS (`pos_sales.farmer_id`) → tab Compras no perfil
- Crédito & Seguro (`useCreditInsurance`) → usa `useFarmers` para perfis financeiros
- IPN (`useIPN`) → cruza `farmer_id` com produção e certificados
- Cooperativas/Escolas → relação `parent_cooperative_id`

**Gaps identificados:**
| # | Gap | Impacto |
|---|---|---|
| A1 | **Perfil não mostra técnico atribuído** — `farmers.technician_id` existe na BD mas `FarmerProfileComplete.tsx` nunca o lê/mostra | O agricultor não sabe quem é o seu técnico |
| A2 | **Perfil não mostra ordens de mecanização** — sem referência a `service_orders` no perfil | Agricultor sem visibilidade de serviços solicitados |
| A3 | **Perfil não mostra alertas de monitoria** — sem link a `monitoring_alerts` | Alertas isolados do perfil |
| A4 | **Perfil não mostra score agrícola** — sem link a `agricultural_scores` | Score desconectado do agricultor |
| A5 | **Perfil não mostra NDVI** — sem link a `ndvi_readings` | Dados satélite isolados |

---

## 2. Módulo Produção ⚠️ Conexão básica

**Conexões existentes:**
- `farmer_id` → liga a agricultores
- Certificados usam `production_history_id`

**Gaps:**
| # | Gap | Impacto |
|---|---|---|
| P1 | **Não alimenta o Score Agrícola** — `useMonitoring` não consulta `production_history` para calcular conformidade | Score calculado sem dados de produção |
| P2 | **Sem link a campanhas/fases** — produção é registo simples, sem fases agronómicas | Falta rastreio temporal |

---

## 3. Módulo Mecanização ⚠️ Isolado

**Conexões existentes:**
- `service_orders.farmer_id` → referência existe na BD
- POS detecta "mecanização" por nome de produto (`hasMechanization`)

**Gaps:**
| # | Gap | Impacto |
|---|---|---|
| M1 | **POS não cria ordens de serviço** — detecta mecanização por string match mas não gera `service_orders` | Pagamento diferido sem ordem real |
| M2 | **Sem link no perfil do agricultor** — nenhum componente mostra ordens de mecanização do agricultor | Informação siloed |
| M3 | **Técnicos não vêem mecanização** — `TechnicianDetailPage` não mostra ordens dos seus agricultores | Técnico sem visão operacional |

---

## 4. Módulo Técnicos de Campo ⚠️ Conexão parcial

**Conexões existentes:**
- `farmers.technician_id` → BD tem a FK
- `TechnicianDetailPage` → mostra farmers atribuídos

**Gaps:**
| # | Gap | Impacto |
|---|---|---|
| T1 | **Perfil do agricultor não mostra técnico** — `FarmerProfileComplete.tsx` ignora `technician_id` | Agricultor desconhece o seu técnico |
| T2 | **Técnico não vê produção dos seus agricultores** — sem agregação de `production_history` | Técnico sem dados operacionais |
| T3 | **Técnico não vê alertas dos seus agricultores** — sem link a `monitoring_alerts` | Técnico desconectado da monitoria |

---

## 5. Módulo Vendas & POS ⚠️ Gaps estruturais

**Conexões existentes:**
- `pos_sales.farmer_id` → liga a agricultores
- Hash fiscal e IVA implementados
- Detecção de mecanização (string match)

**Gaps:**
| # | Gap | Impacto |
|---|---|---|
| V1 | **Sem WalletContext** — não existe carteira digital, débito/crédito, split | Sem controlo financeiro |
| V2 | **Sem ComprasContext** — aprovação de compras subsidiadas sem lógica de débito | Workflow incompleto |
| V3 | **Sem PacotesContext** — quotas por agricultor não são controladas | Sem limite de compra |
| V4 | **POS não valida pacote activo** — `ProductGrid` mostra todos os produtos sem filtrar por pacote do agricultor | Agricultor pode comprar fora do pacote |
| V5 | **POS não cria ordem de mecanização real** — só detecta por nome | Mecanização desconectada |

---

## 6. Módulo Monitoria ⚠️ Isolado dos dados reais

**Conexões existentes:**
- `agricultural_scores.farmer_id` → FK para farmers
- `ndvi_readings.farmer_id` → FK para farmers
- `monitoring_alerts` → por província/município
- Edge function `interpret-sms` → funcional com Lovable AI

**Gaps:**
| # | Gap | Impacto |
|---|---|---|
| MO1 | **Score não é calculado automaticamente** — `agricultural_scores` tem dados estáticos, sem trigger/cálculo a partir de produção+pacotes+mecanização | Score manual, não reflecte realidade |
| MO2 | **NDVI sem edge function** — `ndvi-fetch` não existe, dados são mock | Sem dados reais de satélite |
| MO3 | **Alertas não linkam a ocorrências climáticas** — módulo separado de `climate_occurrences` | Duas fontes de alertas não cruzam |
| MO4 | **Sem notificação push** — alertas existem mas não disparam notificações in-app | Utilizador não é alertado |

---

## 7. Módulo Seguros Agrícolas ❌ NÃO EXISTE (frontend)

**Estado:**
- **Tabelas existem na BD**: `insurance_quotes`, `insurance_policies`, `insurance_claims`, `parametric_rules` — todas com dados vazios
- **Ficheiros frontend NÃO existem**: `src/pages/insurance/InsurancePage.tsx` e `src/hooks/useInsurance.ts` nunca foram criados
- **Rota `/seguros` NÃO existe** em `App.tsx`
- **Sidebar NÃO tem** entrada para Seguros Agrícolas

**Impacto:** Fase 4 do plano anterior falhou silenciosamente — a BD foi migrada mas o frontend não foi gravado.

---

## 8. Módulos Analíticos (ONAF, IPN, Incentivos, Risco Climático, Data Lab)

**Conexões existentes:**
- ONAF → cruza `farmers`, `production_history`, `climate_occurrences`, `forest_licenses` por província ✅
- IPN → cruza `farmers`, `production_history`, `agricultural_certificates` ✅
- Incentivos → `farmer_id` nas alocações ✅
- Risco Climático → `climate_occurrences` por província ✅
- Data Lab → queries genéricas ✅
- Crédito & Seguro → `useFarmers` + `financial_profiles` ✅

**Gaps:**
| # | Gap | Impacto |
|---|---|---|
| AN1 | **ONAF não integra mecanização** — sem dados de ordens de serviço na visão provincial | Indicadores incompletos |
| AN2 | **IPN não integra score agrícola** — calcula score próprio, ignora `agricultural_scores` | Dois scores paralelos |

---

## 9. Portal Público ✅ Maioritariamente autónomo

Consome views SQL públicas. Sem gaps críticos de conexão.

---

## Resumo de Prioridades

| Prioridade | Correcção | Módulos Afectados |
|---|---|---|
| **Crítico** | Criar frontend Seguros Agrícolas (Fase 4 perdida) | Seguros |
| **Alto** | Perfil do agricultor: mostrar técnico, ordens mecanização, score, NDVI | Agricultores ↔ Técnicos ↔ Mecanização ↔ Monitoria |
| **Alto** | POS: criar ordem de mecanização real ao vender serviço | POS ↔ Mecanização |
| **Alto** | Score Agrícola: calcular automaticamente a partir de produção+pacotes | Monitoria ↔ Produção |
| **Médio** | Contextos WalletContext, ComprasContext, PacotesContext | POS |
| **Médio** | Técnico: ver produção e alertas dos seus agricultores | Técnicos ↔ Produção ↔ Monitoria |
| **Baixo** | ONAF integrar mecanização; IPN usar `agricultural_scores` | Analíticos |

---

## Plano de Correcção Proposto

### Bloco 1 — Seguros Agrícolas (restaurar Fase 4)
- Criar `src/hooks/useInsurance.ts`
- Criar `src/pages/insurance/InsurancePage.tsx` (6 tabs: Apólices, Cotações, Sinistros, Regras, NDVI, Auditoria)
- Adicionar rota `/seguros` em `App.tsx`
- Adicionar entrada "Seguros Agrícolas" no `Sidebar.tsx`

### Bloco 2 — Conexões no Perfil do Agricultor
- Editar `FarmerProfileComplete.tsx`: adicionar secções para Técnico Atribuído, Ordens de Mecanização, Score Agrícola, NDVI
- Importar `useTechnicians`, `useMechanization`, `useMonitoring`

### Bloco 3 — POS ↔ Mecanização
- Editar `POSPage.tsx`: ao detectar produto mecanização, criar `service_order` via `useMechanization`
- Adicionar estado `deferred_payment` na ordem

### Bloco 4 — Score Agrícola Automático
- Criar edge function ou lógica no hook que calcula score a partir de `production_history`, `purchase_packages`, `service_orders`
- Actualizar `useMonitoring` para trigger de recálculo

### Bloco 5 — Técnico com visão expandida
- Editar `TechnicianDetailPage.tsx`: adicionar tabs Produção e Alertas dos agricultores atribuídos

**Ficheiros novos: ~3 | Ficheiros a editar: ~6 | Migrations: 0 (tabelas já existem)**

