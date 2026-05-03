## Objetivo

Separar os registos de **Cooperativa** e **Escola de Campo (ECA)** do formulário genérico de Agricultor, criando formulários dedicados, esquemas de validação próprios e tabelas 1:1 para guardar atributos específicos de cada entidade.

## Arquitetura proposta

```text
FarmerForm (individual / family / company)         ← mantém-se
CooperativeForm (novo)  ──┐
                          ├──► farmers (linha base com farmer_type)
FieldSchoolForm (novo) ───┘     + cooperative_details (1:1)
                                + field_school_details (1:1)
```

## 1. Base de Dados (migração)

**Nova tabela `cooperative_details`** (FK 1:1 → `farmers.id`):
- Jurídico: `nif`, `legal_constitution_date`, `dncm_registration_number`, `license_url`, `statutes_url`
- Órgãos sociais: `president_name`, `president_phone`, `secretary_name`, `treasurer_name`, `board_contacts` (jsonb)
- Estrutura: `degree` (1º/2º grau), `total_members`, `share_capital_aoa`, `minimum_quota_aoa`
- Atividade agregada: `aggregated_area_ha`, `infrastructures` (text[]: armazém, silo, processamento, etc.)

**Nova tabela `field_school_details`** (FK 1:1 → `farmers.id`):
- Pedagógico: `facilitator_id` (→ `field_technicians`), `start_date`, `duration_months`, `curriculum_modules` (text[]), `focus_crop`
- Turma: `participants_count`, `participants_male`, `participants_female`, `avg_age_range`, `avg_education_level`
- Promotor: `promoter_entity` (IDA/ONG/Cooperativa), `promoter_name`, `funding_source`, `linked_project`
- Parcela demonstrativa: `demo_parcel_area_ha`, `demo_crops` (text[]), `session_schedule` (jsonb), `demo_latitude`, `demo_longitude`

Ambas com RLS jurisdicional (`is_technician_or_admin` + `can_access_province` via JOIN com `farmers`), trigger `update_updated_at_column`, e campos auditáveis (`created_by`, `updated_by`).

## 2. Frontend — novos formulários

### `src/components/farmers/CooperativeForm.tsx`
Tabs: **Identificação** · **Dados Jurídicos** · **Órgãos Sociais** · **Estrutura Associativa** · **Localização** · **Atividade Agregada** · **Membros**

### `src/components/farmers/FieldSchoolForm.tsx`
Tabs: **Identificação** · **Promotor & Patrocínio** · **Dados Pedagógicos** · **Composição da Turma** · **Localização** · **Parcela Demonstrativa** · **Participantes**

Cada um com:
- Schema Zod próprio em `src/lib/validations.ts` (mensagens em PT)
- Reuso de sub-componentes existentes: `LocationFields`, `MemberSelector`, `DocumentUpload`
- Verificação onBlur de NIF duplicado (igual ao `FarmerForm`)
- `WorkflowStatusBadge` e estados padronizados de `src/lib/constants.ts`

## 3. Páginas e rotas

- **Nova rota** `/cooperativas/nova` → `CooperativeNewPage` (usa `CooperativeForm`)
- **Nova rota** `/escolas-campo/nova` → `FieldSchoolNewPage` (usa `FieldSchoolForm`)
- **Edição**: `/cooperativas/:id/editar` e `/escolas-campo/:id/editar`
- Atualizar botões "Nova Cooperativa" / "Nova ECA" em `CooperativesPage.tsx` e `FieldSchoolsPage.tsx` para apontar para as novas rotas (em vez de `/agricultores/novo?type=...`)
- `FarmerForm` deixa de oferecer `cooperative` e `field_school` no seletor de tipo (apenas individual/family/company)
- `FarmerNewPage` redireciona para a rota dedicada se `?type=cooperative` ou `?type=field_school` for recebido (compatibilidade)

## 4. Hooks de dados

Em `src/hooks/`:
- `useCooperative.ts`: `useCooperative(id)`, `useCreateCooperative()`, `useUpdateCooperative()` — escreve em `farmers` + `cooperative_details` numa única mutação (RPC ou duas chamadas em transação lógica)
- `useFieldSchool.ts`: equivalente para ECA

## 5. Detalhes & visualização

- `FarmerProfileComplete.tsx` (página `/agricultores/:id`): detetar `farmer_type` e renderizar o painel apropriado (`CooperativeDetailsPanel` ou `FieldSchoolDetailsPanel`) carregando da tabela 1:1.
- Cards de listagem em `CooperativesPage` / `FieldSchoolsPage` enriquecidos com os novos campos (ex.: nº de cooperados real, facilitador da ECA).

## 6. Migração de dados existentes

Para cooperativas/ECAs já registadas em `farmers`:
- Criar linha vazia em `cooperative_details` / `field_school_details` automaticamente quando o utilizador abre a edição (upsert idempotente).
- Sem perda de dados; campos novos ficam opcionais até completos.

## 7. Entrega

1. Migração SQL (tabelas, RLS, triggers, índices)
2. Schemas Zod e tipos TS
3. `CooperativeForm` + `FieldSchoolForm`
4. Páginas New/Edit + rotas em `App.tsx`
5. Hooks de leitura/escrita
6. Atualização das páginas de listagem e do perfil
7. QA: verificar fluxo Rascunho → Submetido → Validado nas duas novas entidades

## Notas técnicas

- Mantém a coluna `farmer_type` em `farmers` como discriminador (não duplicar registos).
- Uniqueness de NIF continua na tabela `farmers` (já existe constraint).
- Auditoria: registar criação/alteração nas duas tabelas via `audit_log` (jsonb old/new) conforme política do projeto.
