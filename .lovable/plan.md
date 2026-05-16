## Objetivo

Permitir distinguir, no registo de agricultor, produtores agrícolas tradicionais de produtores de **PFNL** (Produtos Florestais Não-Lenhosos) — mel silvestre, plantas medicinais, frutos silvestres, resinas, etc. — mantendo os tipos atuais (`individual`, `family`, `cooperative`, `field_school`, `company`).

## 1. Base de dados (migração)

Adicionar à tabela `farmers`:

- `activity_category` (text, default `'agricultural'`) — valores: `agricultural`, `pfnl`, `mixed`.
- `pfnl_products` (text[]) — lista de produtos PFNL recolhidos.
- `pfnl_collection_area_ha` (numeric) — área aproximada de zona de coleta.
- `pfnl_target_species` (text[]) — espécies-alvo (ex.: *Adansonia digitata*, *Brachystegia spp.*).
- `pfnl_seasonality` (text) — meses/períodos principais de coleta.
- `pfnl_forest_authorization_ref` (text) — referência à licença/autorização florestal (módulo Florestal).

A `agricultural_certificates` e elegibilidade de cartão **não são afetadas** — produtor PFNL continua elegível a cartão SIGAFLO desde que `farmer_type` não seja cooperativa/escola.

## 2. Constantes partilhadas

Novo ficheiro `src/lib/pfnl.ts`:

- `ACTIVITY_CATEGORIES` — `agricultural | pfnl | mixed` com label PT.
- `PFNL_PRODUCTS` — lista completa: Mel silvestre e cera, Cogumelos silvestres, Plantas medicinais, Frutos silvestres (múcua, maboque, ngangaria), Resinas e gomas, Óleos vegetais não cultivados, Fibras e folhas, Tubérculos silvestres, Outros PFNL.

## 3. Formulário (`FarmerForm.tsx`)

- Adicionar campo **"Categoria de Atividade"** (radio/select) no cartão "Dados Agronómicos", antes da área cultivada.
- Aba/secção dinâmica:
  - Se `agricultural` → mostra apenas "Culturas Principais" (como hoje).
  - Se `pfnl` → esconde "Culturas Principais" e mostra bloco **PFNL**: produtos PFNL (multi-select chips), área de coleta, espécies-alvo (tags), sazonalidade (texto curto), referência de autorização florestal.
  - Se `mixed` → mostra ambos os blocos.
- Atualizar `farmerFormSchema` (zod) com os novos campos (todos opcionais, com `superRefine` exigindo pelo menos 1 produto PFNL quando categoria ≠ `agricultural`).
- Mapear novos campos no `defaultValues` e no payload de submit.

## 4. Visualização

- `FarmerDetail.tsx` / `FarmerProfileComplete.tsx`: novo cartão "Atividade PFNL" condicional ao `activity_category !== 'agricultural'`.
- `FarmersList.tsx`: novo filtro lateral por categoria de atividade (Agrícola / PFNL / Misto) e badge na linha.
- `FarmerTypeIcon` permanece igual; adicionar pequeno selo PT "PFNL" quando aplicável.

## 5. Validações e auditoria

- Schemas Zod em `src/lib/validations.ts` (mensagens em PT).
- Sem mudanças em triggers existentes; alterações registadas via `audit_entity_details` que já captura `to_jsonb(NEW)` da tabela `farmers`.

## Detalhes técnicos

- Tipo TS `ActivityCategory = 'agricultural' | 'pfnl' | 'mixed'` em `src/hooks/useFarmers.ts`.
- Coluna `main_crops` mantida; passa a ser opcional quando `activity_category = 'pfnl'`.
- Migração SQL adiciona colunas com `DEFAULT` seguro para preservar dados existentes (todos os registos atuais ficam como `agricultural`).

## Fora de escopo

- Integração efetiva da `pfnl_forest_authorization_ref` com tabela `forest_licenses` (fica como texto livre por agora, validação cruzada em iteração futura).
- Dashboards/relatórios específicos de PFNL.
