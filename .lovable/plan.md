
# Portabilidade SIGFLO → Módulo Florestal SIGAFLO

Importar o catálogo completo (§2 do REUSE.md) do projeto **Sistema de Gestão Florestal** (`@SIGFLO`), criando todas as tabelas em falta via migrations e mantendo o branding **SIGAFLO** + RBAC jurisdicional já existente.

## Princípios de adaptação

- **Branding**: tudo "SIGFLO" → "SIGAFLO". Reutilizar `AuthContext`, `has_role`, `is_national_level`, `can_access_province/municipality` já existentes — **não** importar enum `user_role` do SIGFLO (já compatível).
- **Geografia**: usar `provinces` e `municipalities` do SIGAFLO (não recriar).
- **Layout**: usar `MainLayout`/`Sidebar` do SIGAFLO; não copiar layouts do SIGFLO.
- **Auditoria**: usar `audit_log` existente.
- **Mapas**: usar edge function `get-mapbox-token` existente.
- **Validação**: Zod com mensagens PT em `src/lib/validations.ts`.
- **Estados workflow**: `src/lib/constants.ts` (Rascunho/Submetido/Validado/Aprovado/Emitido).
- **UI**: `<QueryState>`, `usePaginatedQuery`, skeletons, semantic tokens HSL.

## Fases (ordem de execução)

### Fase 1 — Schema base (migration única)
Criar tabelas em falta com triggers de numeração sequencial e RLS jurisdicional via `is_national_level` + `can_access_province`:

- `forest_operators` (empresas/cooperativas/individuais; tipo, NIF, província, município, estado)
- `forest_licenses` *(já parcialmente: trigger `generate_forest_license_number` existe — alinhar tipos LEX/TRP/EXP/SER/TRA/OPF/PNL/LCS)*
- `forest_logs` (toros — rastreabilidade, espécie, volume m³, GPS)
- `forest_transport_permits` *(já existe — verificar e completar com `species_summary`, `vehicle_plate`, `arrival_at`)*
- `forest_infractions` *(já existe)*
- `forest_complaints` *(já existe)*
- `forest_management_plans` (PMF — EUDR, geometria, espécies, ciclo)
- `forest_reforestation_programs`, `forest_reforestation_activities`, `forest_nurseries`
- `forest_payment_transactions` (TRX, surcharge 10% RL, integração AGT)
- `forest_certificates` (selo verde)
- `forest_occurrences` (OCC — incêndios, pragas)
- `climate_occurrences` *(provavelmente já existe — verificar)*, `province_risk_metrics` *(já existe)*
- Companion: `companion_devices` (api_key_hash SHA-256), `operator_biometrics`, `operator_nfc_cards`, `field_captures`

Triggers de numeração: TRP/EXP/SER/TRA/OPF/PNL/LCS-YYYY-XXXXXX, GT, PMF, TRX, OCC.

Storage buckets a criar: `operator-documents` (privado), `license-documents` (público).

### Fase 2 — Edge Functions
Importar de `@SIGFLO/supabase/functions/`:
- `agt-payment` (mock pagamento AGT)
- `climate-alerts` (ingestão INAMET)
- `companion-ingest` (header `X-Device-API-Key`)
- `download-document` (proxy storage privado)
- `green-certification` (cálculo selo)
- `forestry-ai` (gemini-2.5-flash via `LOVABLE_API_KEY`)

`config.toml`: ajustar `verify_jwt` por função (companion-ingest = false; outras = true).

### Fase 3 — Componentes & Páginas (cross-project copy)
Copiar/adaptar de `@SIGFLO/src/components/forestry/`:

**Já existem no SIGAFLO** (rever/melhorar): `complaints/`, `enforcement/`, `reforestation/`, `traceability/`, `LicenseForm`, `LogForm`, `TransportPermitForm`, `ConcessionDetail`, `ForestInventoryDashboard`.

**A importar**:
- `operator/` + `OperatorForm.tsx` + `OperatorFormContent.tsx` + `OperatorDetailDialog.tsx`
- `licensing/` + `FeeCalculator.tsx`
- `transport/` (lista + detalhe avançado)
- `payments/` (transações AGT + surcharge)
- `certification/` + `certificates/` (selo verde)
- `management/` (planos de maneio EUDR)
- `climate/` (alertas climáticos)
- `occurrences/` (incêndios, pragas)
- `production/` (declaração produção florestal)
- `volumes/` (concessão)
- `public/` (verificação pública QR/licenças)

**Páginas a criar em `src/pages/forestry/`**:
- `OperatorsPage`, `OperatorRegisterPage`, `OperatorDetailPage`
- `ConcessionLicensingPage`, `ConcessionVolumesPage`, `ManagementPlansPage`
- `TransportGuidesPage`, `FeeTablePage`, `PaymentsPage`
- `ForestProductionPage`, `FieldOperationsPage`
- `ForestryClimatePage`, `ForestryFiresPage`, `ForestryPestsPage`, `ForestryOccurrencesPage`, `OccurrencesMapPage`, `OccurrencesStatsPage`
- `NurseriesPage`, `ReforestationMonitoringPage`, `SeizuresPage`
- `GreenCertificationPage`, `CertificateValidationPage`
- `QRVerificationPage` (público), `PublicDashboardPage`

**Admin**: `CompanionDevicesPage`, `NFCCardsPage`, `FieldCapturesAuditPage`.

### Fase 4 — Hooks & Libs
- Adaptar `useForestry.ts` existente para cobrir todas as novas tabelas (operators, licenses, permits, payments, certificates, plans, occurrences).
- Importar `lib/pdfGenerator.ts` (html2canvas + jsPDF, JPEG 0.82, scale 1.25 — evita 413).
- Importar `lib/certificateTemplates.ts`.
- Importar `lib/exportUtils.ts` (CSV/Excel) — mesclar com `exportService.ts` existente.

### Fase 5 — Routing & Sidebar
- Adicionar rotas em `App.tsx` agrupadas em `/florestal/*`.
- Atualizar `Sidebar.tsx` com secção **Gestão Florestal** com sub-itens, controlando visibilidade via `requiredRoles`.
- Verificação pública em `/florestal/verificar/:codigo` (sem auth).

### Fase 6 — Convenções SIGAFLO
- Surcharge 10% RL em `lib/fiscal.ts` (configurável).
- PDFs de licenças gerados na **aprovação do pagamento** (síncrono).
- Mensagens de erro PT-AO em `lib/errorMessages.ts`.
- Memória do projecto: novos memory files para `forestry-operators`, `forestry-licensing`, `forestry-eudr`, `forestry-companion-nfc`, `agt-surcharge-10rl`.

## Detalhes técnicos

```text
Estrutura de rotas resultante:
/florestal/                       (dashboard — já existe)
  operadores/                     (lista, registo, detalhe)
  licenciamento/                  (pedidos, aprovação, taxas)
  transporte/                     (guias GT, verificação)
  pagamentos/                     (transações AGT + surcharge)
  rastreabilidade/                (já existe)
  inventario/                     (já existe)
  fiscalizacao/                   (já existe + apreensões)
  denuncias/                      (já existe)
  reflorestamento/                (já existe + viveiros, monitorização)
  planos-maneio/                  (EUDR)
  certificacao/                   (selo verde, validação)
  ocorrencias/                    (incêndios, pragas, mapa, stats)
  clima/                          (alertas INAMET)
  publico/                        (verificação QR sem auth)
admin/
  companion-devices/
  nfc-cards/
  field-captures/
```

## Riscos & decisões

- **Conflito de nomes**: tabelas `forest_*` já parcialmente existentes — verificar colunas antes de `ALTER`/`CREATE`. Migration usará `IF NOT EXISTS` e `ADD COLUMN IF NOT EXISTS`.
- **Volume**: ~30 páginas + ~40 componentes + ~10 tabelas + 6 edge functions. Implementação em 6 mensagens (uma por fase) para manter cada migração revisável.
- **Companion devices** requer app Android externa — entregue mas sem cliente físico para testar end-to-end nesta iteração.
- **AGT mock** — manter desacoplado para troca futura por gateway real.
- **Sem auto-registo público**; demos via domínio existente do SIGAFLO.

## Entrega proposta

1. Mensagem 1: Migration Fase 1 (schema completo) + buckets.
2. Mensagem 2: Edge functions (Fase 2) + `config.toml`.
3. Mensagem 3: Operadores + Licenciamento + Pagamentos AGT (componentes + páginas + rotas).
4. Mensagem 4: Transporte + Planos Maneio (EUDR) + Certificação Verde.
5. Mensagem 5: Ocorrências/Clima/Incêndios/Pragas + Viveiros + Verificação Pública QR.
6. Mensagem 6: Companion/NFC/Field Captures + ajustes finais sidebar + memórias.
