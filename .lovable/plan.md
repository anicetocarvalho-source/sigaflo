

# RELATÓRIO DE AUDITORIA TÉCNICA E FUNCIONAL — SIGAFLO v1.0

**Data:** 21 de Março de 2026
**Âmbito:** Avaliação de prontidão para produção nacional

---

## 1. ARQUITECTURA GERAL

### Pontos Positivos
- Separação clara por módulos sectoriais (Florestal, Café, Arroz, Agricultores)
- Hooks dedicados por domínio (`useFarmers`, `useForestry`, `useCoffee`, etc.)
- RBAC jurisdicional implementado com funções SQL (`has_role`, `can_access_province`, `can_access_municipality`)
- Paginação server-side disponível via `usePaginatedQuery`

### Falhas e Riscos

| ID | Severidade | Achado |
|---|---|---|
| A1 | **IMPORTANTE** | **Dados DEMO misturados com produção.** As edge functions `seed-demo-data` e `seed-demo-users` inserem dados directamente nas tabelas de produção. Não existe separação lógica (flag `is_demo`) nem schema separado. Em produção, não há forma de distinguir ou limpar dados de demonstração. |
| A2 | **IMPORTANTE** | **N+1 queries no ONAF.** `useONAF.ts` (linha 198) executa 6 queries paralelas **por cada província** (18 províncias = 108 queries simultâneas). Isto é um problema grave de performance com dados reais. |
| A3 | **IMPORTANTE** | **Sem paginação em hooks críticos.** `useFarmers`, `useFarmerStats`, `useONAF` (national stats) carregam TODOS os registos sem limite. Com 100k+ agricultores, a query `select('*')` vai exceder o limite de 1000 rows do Supabase e truncar silenciosamente os resultados. Os KPIs serão incorrectos. |
| A4 | OPCIONAL | Tipo duplicado `src/types/index.ts` define `Farmer`, `UserRole` etc. que divergem dos tipos reais usados (`src/hooks/useFarmers.ts`). Ficheiro legacy não utilizado que pode causar confusão. |

---

## 2. FLUXOS FUNCIONAIS (END-TO-END)

### A. Agricultor: Registo → Produção → Ocorrência → Crédito → Certificação

| Passo | Estado | Problema |
|---|---|---|
| Registo | ✅ Funcional | Geração automática de número, workflow completo |
| Produção | ✅ Funcional | CRUD com link ao agricultor |
| Ocorrência | ✅ Funcional | IA integrada para recomendações |
| Crédito | ⚠️ Parcial | **[F1]** Os perfis financeiros são calculados client-side com dados estáticos. Não existe trigger/cron para recalcular scores automaticamente quando há nova produção ou ocorrência. Score de crédito pode estar desactualizado. |
| Certificação | ✅ Funcional | QR code, verificação pública |

### B. Café: Produtor → Lote → Checkpoints → Certificação → Portal Público
- ✅ Fluxo completo implementado com semaforização e verificação pública

### C. Florestas: Licença → Exploração → Transporte → Fiscalização → Sanção

| Passo | Estado | Problema |
|---|---|---|
| Licença | ✅ | Workflow completo, numeração automática |
| Transporte | ⚠️ | **[F2]** `TransportPermitForm` gera números com `Math.random()` (linha 132). Não usa trigger SQL como licenças. Risco de colisão e números não sequenciais. |
| Fiscalização | ✅ | Infracções com workflow completo |
| Sanção | ⚠️ | **[F3]** Não existe fluxo explícito de aplicação de sanção (multa, suspensão de licença). A infracção pode ser "sanctioned" mas não há registo do valor da multa nem link à licença afectada. |

### D. Arroz: Produção → Previsão → Importação → Preço → Política
- ✅ Dados completos, simulador funcional
- ⚠️ **[F4]** O módulo de Consumo (`RiceConsumptionPage`) existe na rota mas não há hook `useRiceConsumption` visível — verificar se usa dados reais ou estáticos.

---

## 3. RBAC — CONTROLO DE ACESSO

### Falhas Críticas

| ID | Severidade | Achado |
|---|---|---|
| R1 | **BLOQUEANTE** | **Apenas 2 rotas têm `requiredRoles`.** `/utilizadores` e `/laboratorio-dados` são as únicas rotas com restrição de papel. Todas as outras rotas (Incentivos, Crédito, ONAF, Forestry, etc.) são acessíveis a QUALQUER utilizador autenticado, incluindo `viewer` e `private_entity`. Um exportador pode aceder ao módulo de Fiscalização Florestal, Incentivos, e Risco Climático sem restrição. |
| R2 | **IMPORTANTE** | **RLS protege dados mas UI não filtra.** Mesmo que RLS restrinja dados por província, a UI não informa o utilizador que está a ver dados filtrados. Sem feedback visual, o utilizador pode pensar que não existem dados. |
| R3 | **IMPORTANTE** | **Sidebar filtra `adminOnly` mas não filtra por papel.** O menu lateral mostra todos os módulos a todos os utilizadores autenticados. Um `viewer` vê "Gestão de Incentivos", "Crédito e Seguro", "Risco Climático" no menu, navega até lá, e vê dados (ou dados vazios sem explicação). |

---

## 4. MÓDULOS — COBERTURA E COERÊNCIA

| Módulo | Cobertura | Problemas |
|---|---|---|
| Agricultores | 95% | Completo. Falta: validação de duplicados por BI/NIF. |
| Cooperativas | 90% | Funcional. Regras de membership implementadas. |
| Produção | 90% | Funcional. Sem validação de safra vs. época real. |
| Café | 85% | Funcional. Sem link directo produtor→cooperativa no lote. |
| Florestas | 85% | Completo. Falta sanção explícita (ver F3). |
| Ocorrências | 90% | IA funcional. SMS é simulador apenas. |
| Crédito/Seguro | 70% | Simulação funcional. Scores estáticos (ver F1). |
| Incentivos | 85% | Programas e alocações funcionais. |
| Infra-estruturas | 75% | CRUD básico. Sem analytics. |
| ONAF | 80% | Performance crítica (ver A2). Dados misturados com simulados. |
| Portal Público | 95% | Completo. QR funcional. |

---

## 5. DADOS E QUALIDADE

| ID | Severidade | Achado |
|---|---|---|
| D1 | **IMPORTANTE** | **Sem detecção de duplicados.** Não existe validação unique no campo `bi_nif` dos agricultores. Dois registos com o mesmo BI podem coexistir. |
| D2 | **IMPORTANTE** | **Dados simulados em produção.** `useClimateRiskAnalytics.ts` (linha 314-326) injeta dados aleatórios com `Math.random()` quando não há dados reais para um ano. Estes dados FALSOS aparecem em dashboards de decisão como se fossem reais. Sem qualquer indicação visual. |
| D3 | **IMPORTANTE** | **`useDataLab.ts`** usa `Math.random()` para "active_sessions" (linha 370). Dado fictício num módulo de análise científica. |
| D4 | **IMPORTANTE** | **`ProductiveProfileDetail.tsx`** (linha 90) calcula tendência de produção com `Math.random()`. O IPN (Identidade Produtiva Nacional) mostra tendências FALSAS. |
| D5 | OPCIONAL | `TimeSeriesAnalysis.tsx` no DataLab usa dados 100% gerados com `Math.random()`. |
| D6 | OPCIONAL | Códigos de toros (`LogForm`) e árvores (`TreeForm`) gerados com `Math.random()` em vez de sequência controlada por trigger SQL. |

---

## 6. DASHBOARDS E KPIs

| Achado | Impacto |
|---|---|
| **KPIs do ONAF usam `data.length` sem paginação** — com >1000 registos, os totais ficam truncados em 1000 | Um decisor vê "1000 agricultores" quando existem 50.000 |
| **Dados simulados misturados com reais** nos charts de Risco Climático | Decisor toma decisões baseadas em dados falsos |
| **Sem timestamp de última actualização** nos dashboards | Sem confiança na frescura dos dados |
| **Alertas inteligentes** implementados mas sem notificação push/email real | Alertas só visíveis se o utilizador navegar até à página |

---

## 7. PERFORMANCE E USABILIDADE

| ID | Severidade | Achado |
|---|---|---|
| P1 | **BLOQUEANTE** | **ONAF: 108+ queries simultâneas.** Para cada uma das 18 províncias, executa 6 queries em paralelo. Em produção com latência real, tempo de carregamento >10s. |
| P2 | **IMPORTANTE** | **`useFarmerStats` carrega TODOS os agricultores** (`select('farmer_type, status, province_id, provinces(name)')`) sem `.limit()`. Com 100k registos, excede 1000-row limit e stats ficam errados. |
| P3 | OPCIONAL | `usePaginatedQuery` existe mas não é usado em todos os hooks. Vários hooks fazem `select('*')` sem paginação. |

---

## 8. OFFLINE, SMS E OPERAÇÃO DE CAMPO

| ID | Severidade | Achado |
|---|---|---|
| O1 | **BLOQUEANTE** | **Zero capacidade offline.** Sem Service Workers, sem IndexedDB, sem cache de formulários. Um técnico em zona rural perde TODO o trabalho se perder conexão durante o preenchimento de um registo. |
| O2 | **IMPORTANTE** | **SMS é simulador.** `SmsSimulator.tsx` apenas mostra UI de simulação. Sem integração real com gateway SMS (Twilio, Africa's Talking, etc.). |
| O3 | **IMPORTANTE** | **Sem classificação automática de mensagens SMS.** O fluxo descrito (reporte por SMS → classificação → registo) não existe. |

---

## 9. SEGURANÇA E CONFORMIDADE

| ID | Severidade | Achado |
|---|---|---|
| S1 | **IMPORTANTE** | **Leaked Password Protection** requer activação manual no dashboard (confirmado pendente). |
| S2 | **IMPORTANTE** | **Storage buckets `avatars` e `farmer-documents` são PÚBLICOS** (`is_public: true`). Documentos de identidade (BI) de agricultores estão acessíveis publicamente a quem tiver o URL. Violação de privacidade grave. |
| S3 | OPCIONAL | Trilha de auditoria (`audit_log`) existe na tabela mas não há evidência de inserção automática de eventos via triggers. Os logs de auditoria podem estar vazios. |
| S4 | OPCIONAL | Sem rate-limiting nas edge functions públicas (`report-occurrence-ai`, `get-mapbox-token`). |

---

## 10. PRONTIDÃO PARA PRODUÇÃO

### BLOQUEANTES (impedem go-live)

| # | Item | Esforço |
|---|---|---|
| 1 | **R1:** Adicionar `requiredRoles` a TODAS as rotas sensíveis | 2h |
| 2 | **S2:** Tornar bucket `farmer-documents` PRIVADO | 30min |
| 3 | **O1:** Modo offline mínimo (cache de formulários, queue de sync) | 2-3 semanas |
| 4 | **P1:** Refactoring do ONAF para usar views SQL agregadas | 1-2 dias |

### IMPORTANTES (produção degradada sem estes)

| # | Item | Esforço |
|---|---|---|
| 5 | **D2/D4/D5:** Remover TODOS os `Math.random()` de hooks e componentes de dados | 1 dia |
| 6 | **A3/P2:** Migrar hooks sem paginação para `usePaginatedQuery` ou usar `count: 'exact'` com queries agregadas | 2-3 dias |
| 7 | **D1:** Adicionar constraint UNIQUE em `bi_nif` na tabela `farmers` | 30min |
| 8 | **R3:** Filtrar sidebar por papel do utilizador (não apenas `adminOnly`) | 3h |
| 9 | **F2:** Migrar geração de códigos de toros/árvores/transportes para triggers SQL | 2h |
| 10 | **S1:** Activar Leaked Password Protection | 5min |
| 11 | **F1:** Implementar recálculo automático de scores financeiros | 1 dia |

### OPCIONAIS (melhorias desejáveis)

| # | Item |
|---|---|
| 12 | Integração real com gateway SMS |
| 13 | Notificações push/email para alertas |
| 14 | Timestamp "última actualização" nos dashboards |
| 15 | Remover `src/types/index.ts` (ficheiro legacy) |
| 16 | Rate-limiting em edge functions públicas |
| 17 | Triggers de auditoria automáticos |

---

## 11. RECOMENDAÇÕES

### Antes do Piloto (MVP)

1. **Corrigir R1** — restringir rotas por papel (prioridade máxima, risco de acesso indevido)
2. **Corrigir S2** — tornar bucket de documentos privado (violação de privacidade)
3. **Remover dados simulados** (D2, D4, D5) — mostrar "Sem dados" em vez de dados falsos
4. **Corrigir P1** — substituir N+1 no ONAF por view SQL agregada

### Antes de Produção Nacional

5. Implementar modo offline mínimo com Service Workers
6. Migrar todos os hooks para paginação server-side
7. Implementar detecção de duplicados
8. Integrar gateway SMS real
9. Implementar triggers de auditoria

### Classificação Final

```text
┌──────────────────────────────────────────┐
│  SIGAFLO v1.0 — ÍNDICE DE MATURIDADE    │
│                                          │
│  Segurança:        ██████░░░░  60%       │
│  Funcionalidade:   ████████░░  82%       │
│  Performance:      █████░░░░░  50%       │
│  Usabilidade:      ████████░░  80%       │
│  Operação Campo:   ██░░░░░░░░  15%       │
│  Dados/Qualidade:  █████░░░░░  55%       │
│                                          │
│  GLOBAL:           ██████░░░░  57/100    │
│                                          │
│  Veredicto: NÃO PRONTO PARA PRODUÇÃO    │
│  Pronto para piloto após correcções 1-4  │
└──────────────────────────────────────────┘
```

