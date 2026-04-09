

# Módulo de Gestão de Agricultores — Gap Analysis e Plano de Implementação

## Estado Actual vs. Especificação

| Funcionalidade | Estado | Prioridade |
|---|---|---|
| Listagem com filtros, pesquisa, paginação | ✅ Existe | — |
| Formulário multi-tab (Pessoal, Localização, Biometria, Parcela) | ✅ Existe | — |
| Perfil com tabs (Identificação, Agregado, Documentos, Cartão, Produção, Certificados, Ocorrências, Incentivos, Scores) | ✅ Existe | — |
| Workflow de validação (draft→issued) com RBAC | ✅ Existe | — |
| Cartão CR-80 com QR + exportação PDF | ✅ Parcial (ProducerCertificate) | Melhorar |
| **Representantes legais (CRUD)** | ❌ Não existe | Alta |
| **Parcelas CRUD + mapa satélite + polígonos** | ❌ Não existe (sem tabela `farmer_parcels`) | Alta |
| **Campanhas produtivas (10 fases)** | ❌ Não existe | Média |
| **Tab AgroPay no perfil** (saldo, transacções) | ❌ Não existe | Média |
| **Tab Compras no perfil** (pacote activo, quotas) | ❌ Não existe | Média |
| **Tab Biometria** (mapa visual 10 dedos) | ❌ Não existe como tab separada | Média |
| **Tab Previsão** (plano técnico agronómico) | ❌ Não existe | Média |
| **Provisionamento automático** (pacote + incentivos ao criar) | ❌ Não existe | Média |
| **Cadastro de Campo mobile** (`/cadastro-campo`) | ❌ Não existe | Alta |
| **Acesso Externo** (`/cadastro-externo`) | ❌ Não existe | Baixa |
| **Listagem de Parcelas** (`/parcelas`) com KPIs e mapa | ❌ Não existe | Média |
| Exportação PDF em lote (A4, 3×3 grid) | ❌ Parcial | Média |
| Duplicação de BI cross-check | ❌ Não existe | Alta |

---

## Plano de Implementação (3 Fases)

### FASE 1 — Tabelas e Dados Base

**Migration SQL:**
1. Tabela `farmer_representatives` (id, farmer_id FK, name, bi, phone, relationship, province_id, municipality_id, photo_url, fingerprint_complete, fingers_captured, synced, created_at)
2. Tabela `farmer_parcels` (id, farmer_id FK, name, municipality_id, province_id, commune_id, area_ha, main_crop, crops[], status [active/pending/inactive], latitude, longitude, soil_type, water_source, irrigation_system, created_at)
3. Tabela `parcel_polygons` (id, parcel_id FK, polygon JSONB, created_at)
4. Tabela `farmer_campaigns` (id, farmer_id FK, parcel_id FK, crop, current_phase, phase_number, total_phases=10, start_date, expected_harvest, status [in_progress/completed/cancelled], created_at)
5. RLS: técnicos e admins CRUD, viewers SELECT

### FASE 2 — Perfil do Agricultor Expandido (6 novas tabs)

**Novos componentes:**

1. **`FarmerRepresentatives.tsx`** — CRUD de representantes com formulário (nome, BI, telefone, parentesco), validação de duplicação BI, foto e biometria simulada
2. **`FarmerParcels.tsx`** — CRUD de parcelas com chips de culturas, coordenadas GPS, mapa Mapbox satélite com marcadores, link para edição de polígonos
3. **`FarmerCampaigns.tsx`** — Lista de campanhas com barra de progresso (fase x/10), as 10 fases sequenciais
4. **`FarmerAgroPay.tsx`** — Consulta `farmer_wallets`, mostra saldo, limite por ha, histórico de transacções (via `pos_sales` filtrado)
5. **`FarmerPurchases.tsx`** — Pacote activo do agricultor (`purchase_packages`), quotas por produto, consumo acumulado, botão "Pedir Reforço"
6. **`FarmerBiometry.tsx`** — Mapa visual de 10 dedos (5 mão direita + 5 mão esquerda) com estado e qualidade
7. **`FarmerForecast.tsx`** — Plano técnico recomendado baseado em regras agronómicas (cultura × zona × área)

**Actualizar `FarmerProfileComplete.tsx`**: Adicionar 7 novas tabs ao TabsList existente.

### FASE 3 — Cadastro de Campo + Parcelas

**Novas páginas:**

1. **`/cadastro-campo`** — Formulário mobile-first de 7 passos com stepper, suporte offline (IndexedDB), cronometragem por secção, sincronização com progresso
2. **`/cadastro-externo`** — Página admin com link copiável, QR Code, Web Share API
3. **`/parcelas`** — Listagem dedicada com KPIs (total, área, média, % activas), mapa satélite, filtros

**Novos ficheiros (~12):**
- `src/pages/farmers/FieldRegistrationPage.tsx`
- `src/pages/farmers/ExternalAccessPage.tsx`
- `src/pages/farmers/ParcelsListPage.tsx`
- `src/components/farmers/FarmerRepresentatives.tsx`
- `src/components/farmers/FarmerParcels.tsx`
- `src/components/farmers/FarmerCampaigns.tsx`
- `src/components/farmers/FarmerAgroPay.tsx`
- `src/components/farmers/FarmerPurchases.tsx`
- `src/components/farmers/FarmerBiometry.tsx`
- `src/components/farmers/FarmerForecast.tsx`
- `src/lib/agronomicRules.ts` (motor de regras cultura → pacote)

**Ficheiros a editar (~3):**
- `FarmerProfileComplete.tsx` (7 novas tabs)
- `FarmerForm.tsx` (tab Previsão + validação BI duplicado)
- `App.tsx` + `Sidebar.tsx` (novas rotas)

