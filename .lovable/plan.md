
# Plano: Módulo Arroz → Módulo Grãos

Transformar o módulo "Arroz" num módulo "Grãos" abrangente, suportando vários tipos de cereais relevantes para a soberania alimentar de Angola, mantendo todos os dados históricos de arroz intactos.

## Tipos de grão suportados
Arroz, Milho, Trigo, Sorgo, Massambala, Massango, Cevada, Aveia. Enum extensível.

## Abordagem
Adicionar coluna `grain_type` (com default `'arroz'`) às tabelas existentes em vez de renomear — preserva dados, RLS e referências. UI passa a apresentar-se como "Grãos" com selector global de tipo de grão (persistido em URL/localStorage) e dashboard consolidado com drill-down.

## Mudanças

### 1. Base de dados (migração)
- Criar enum `grain_type`: `arroz | milho | trigo | sorgo | massambala | massango | cevada | aveia`.
- Adicionar coluna `grain_type grain_type NOT NULL DEFAULT 'arroz'` em:
  - `rice_production`
  - `rice_imports`
  - `rice_prices`
  - `rice_consumption`
  - `rice_alerts`
  - `rice_policies` (se aplicável)
- Backfill: dados existentes ficam como `'arroz'`.
- Índices: `CREATE INDEX ... ON rice_* (grain_type, year)`.
- Manter nomes de tabelas `rice_*` (refactor de nomes fica para fase futura, sem impacto funcional).

### 2. Camada de dados (`src/hooks/useRice.ts` → `useGrains.ts`)
- Renomear hook e tipos: `RiceProduction` → `GrainProduction`, etc. (adicionar campo `grain_type`).
- Manter export alias `useRice*` para não quebrar imports temporariamente.
- Todos os hooks aceitam parâmetro opcional `grainType?: GrainType` para filtrar.
- Novo hook `useGrainsOverview()` que agrega todos os tipos.

### 3. UI / Rotas
- Nova rota canónica `/graos/*` com redirect 301-style de `/arroz/*` para `/graos/*?type=arroz`.
- Páginas renomeadas: `GrainsDashboard`, `GrainProductionPage`, `GrainImportsPage`, `GrainPricesPage`, `GrainConsumptionPage`, `GrainPoliciesPage`.
- Novo componente `<GrainTypeSelector />` no header do módulo (dropdown com ícone por grão; opção "Todos os grãos" para vista agregada).
- Dashboard: vista consolidada (totais agregados) + tabs por tipo de grão com KPIs específicos. Comparativos cross-grão (ex.: produção arroz vs milho).
- Formulários (`RiceProductionForm`, `RiceImportForm`, `RicePriceForm`) → adicionar campo obrigatório "Tipo de grão" no topo.
- `RiceOverview` no dashboard principal → `GrainsOverview` mostrando soma de todos os grãos + breakdown.

### 4. Sidebar / navegação
- Item "Arroz" → "Grãos" (ícone `Wheat` do lucide).
- Submenus: Dashboard, Produção, Importações, Preços, Consumo, Políticas.
- `src/lib/modules.ts` e permissões: rename do módulo `rice` → `grains` (migração SQL no enum `app_module` com backfill).

### 5. Portal público
- `PortalRice` → `PortalGrains` com tabs por grão. Rota `/portal/arroz` mantém-se com redirect para `/portal/graos`.

### 6. Textos & i18n
- Substituir "Arroz" por "Grãos" em títulos genéricos do módulo.
- Manter "Arroz" onde se refere especificamente ao tipo (KPIs, séries por grão).
- Recomendação no `RiceOverview` torna-se contextual ao grão seleccionado.

## Detalhes técnicos

```text
src/
├── hooks/useGrains.ts                 (renomeado de useRice.ts)
├── pages/grains/                      (renomeado de rice/)
│   ├── GrainsDashboard.tsx
│   ├── GrainProductionPage.tsx
│   ├── GrainImportsPage.tsx
│   ├── GrainPricesPage.tsx
│   ├── GrainConsumptionPage.tsx
│   └── GrainPoliciesPage.tsx
├── components/grains/
│   ├── GrainTypeSelector.tsx          (novo)
│   ├── GrainsOverview.tsx             (substitui RiceOverview no dashboard)
│   ├── GrainProductionSection.tsx
│   ├── GrainImportsSection.tsx
│   ├── GrainPricesSection.tsx
│   ├── GrainAlertsPanel.tsx
│   ├── GrainKPICard.tsx
│   ├── GrainSimulator.tsx
│   └── forms/ (campo grain_type adicionado)
└── lib/grains.ts                      (constantes: GRAIN_TYPES, labels, ícones, cores)
```

`GRAIN_TYPES` define ordem, label PT, cor e ícone para cada tipo, usado em selectores, badges e gráficos comparativos.

Redirects React Router: `/arroz/*` → `<Navigate to="/graos/..." replace />` preservando subpath e adicionando `?type=arroz` quando aplicável.

## Migração de dados
Não há perda: todos os registos existentes ficam classificados como `'arroz'` via DEFAULT. Utilizadores podem reclassificar/adicionar novos tipos via UI.

## Fora do âmbito (esta iteração)
- Renomear fisicamente tabelas `rice_*` → `grain_*` (pode ser feito depois, sem urgência).
- Importação massiva de dados históricos de outros grãos (utilizador adiciona manualmente ou via seed posterior).
- Alteração das tabelas `rice_*` para outras estruturas — apenas adicionamos coluna.
