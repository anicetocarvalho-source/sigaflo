# Reorganização dos Perfis de Agricultor, Cooperativa e ECA

## Problema atual

A página `FarmerProfileComplete` usa **17+ abas em scroll horizontal** para todos os tipos de entidade (individual, family, company, cooperative, field_school). Isso causa:

- Sobrecarga cognitiva — muitas abas planas, sem hierarquia
- Abas irrelevantes para o tipo (ex.: "Agregado" não faz sentido para cooperativa; "Mecanização" não se aplica a ECA)
- Detalhes específicos de Cooperativa/ECA (`CooperativeDetailsCard`, `FieldSchoolDetailsCard`) ficam diluídos entre abas operacionais
- Cards de KPI (Quick Stats) idênticos para todos os tipos, sem refletir métricas específicas (ex.: nº de cooperados, participantes da turma)

## Proposta: agrupar abas em 5 grupos lógicos + variantes por tipo

Substituir a fileira plana de abas por **grupos de nível 1** (tabs principais) e dentro de cada grupo **sub-abas** (segmented control). Os grupos e o conteúdo são adaptados ao `farmer_type`.

### Estrutura unificada (5 grupos principais)

```text
┌─ Identificação ─┬─ Operação ─┬─ Financeiro ─┬─ Monitoria ─┬─ Governança ─┐
```

**1. Identificação** (sempre visível)
- Dados gerais (contactos, localização, mapa)
- Documentos
- Cartão / QR
- Biometria *(apenas individual/family)*
- **Detalhes da Cooperativa** *(apenas cooperative — usa `CooperativeDetailsCard` + `EntityDetailsConsistency`)*
- **Detalhes da ECA** *(apenas field_school — usa `FieldSchoolDetailsCard` + `EntityDetailsConsistency`)*

**2. Operação**
- Parcelas (GIS)
- Campanhas
- Produção (histórico)
- Mecanização *(oculto para ECA)*
- Membros *(apenas cooperative/field_school — lista filtrada de `members`)*

**3. Financeiro**
- AgroPay
- Compras
- Incentivos
- Scores (crédito + seguro)
- Certificados

**4. Monitoria**
- Ocorrências climáticas
- NDVI / Alertas
- Previsão (forecast)

**5. Governança**
- Representantes
- Workflow / Auditoria (mover `WorkflowActions` para dentro deste grupo, em vez de card flutuante no topo)
- Técnico responsável

### Variantes de KPIs (Quick Stats) por tipo

Substituir os 4 cards genéricos por um conjunto adaptado:

- **Individual / Family**: Área cultivada · Score produtivo · Incentivos · Ocorrências
- **Company**: Área cultivada · Produção anual · Faturação · Score crédito
- **Cooperative**: Nº cooperados (declarado vs. computado) · Área agregada · Cultura focal · Ocorrências
- **Field School (ECA)**: Participantes (M/F) · Cultura focal · Área demonstrativa · Duração restante

### Páginas de listagem (Cooperativas / ECA)

Manter a estrutura atual mas reordenar os cards de detalhe:

- **CooperativesPage**: card de filtros colapsável no topo · KPIs gerais · tabela com colunas reorganizadas (Nome → NIF → Presidente → Membros → Área → Status → Ações)
- **FieldSchoolsPage**: idem com (Nome → Cultura → Participantes → Início → Duração → Status → Ações)

## Detalhes técnicos

### Componentes a criar

- `src/components/farmers/profile/ProfileTabGroups.tsx` — orquestrador dos 5 grupos com sub-abas
- `src/components/farmers/profile/QuickStatsByType.tsx` — KPIs adaptados por `farmer_type`
- `src/components/farmers/profile/IdentificationGroup.tsx` — agrupa dados gerais, docs, cartão, biometria, detalhes coop/ECA
- `src/components/farmers/profile/OperationGroup.tsx`
- `src/components/farmers/profile/FinancialGroup.tsx`
- `src/components/farmers/profile/MonitoringGroup.tsx`
- `src/components/farmers/profile/GovernanceGroup.tsx`

### Componentes a refatorar

- `FarmerProfileComplete.tsx` — reduzir para shell (header + KPIs + `<ProfileTabGroups>`); remover a `<TabsList>` plana atual
- Reaproveitar tudo o que já existe: `FarmerParcels`, `FarmerCampaigns`, `FarmerAgroPay`, `FarmerPurchases`, `FarmerBiometry`, `FarmerCard`, `FarmerForecast`, `FarmerRepresentatives`, `CooperativeDetailsCard`, `FieldSchoolDetailsCard`, `EntityDetailsConsistency`, `WorkflowActions`

### Sem mudanças de backend

- Apenas reorganização de UI/apresentação
- Hooks (`useCooperative`, `useFieldSchool`, etc.) e RLS permanecem inalterados
- Nenhuma migração SQL

### Acessibilidade e responsivo

- Tabs principais: ícone + label visível em ≥ md, só ícone em mobile com tooltip
- Sub-abas: `segmented control` (radix tabs com variant pill); em mobile vira `Select` dropdown
- Preservar deep-link via query param `?tab=identification&sub=card` para abrir aba específica (útil para os botões "ver detalhes" já existentes)

## Fora do âmbito

- Não alterar lógica de negócio, validações Zod, ou políticas RLS
- Não refatorar formulários de edição (`FarmerForm`, `CooperativeForm`, `FieldSchoolForm`)
- Não mexer em `ProfilePage` (perfil do utilizador do sistema, não do agricultor)
