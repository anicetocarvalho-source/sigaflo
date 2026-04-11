

# Auditoria: Estados de Loading, Erro e Vazio por Modulo

## Metodologia
Analise estatica de todos os componentes principais verificando tres estados criticos:
1. **Loading** — indicador visual (Skeleton, Loader2, animate-spin, texto "Carregando...")
2. **Erro** — tratamento de falha de query (UI de erro, ou pelo menos toast)
3. **Vazio** — mensagem quando array de dados esta vazio

## Resultados da Analise

### Modulos COM os 3 estados (Loading + Vazio + Erro via toast em mutations)
| Modulo | Loading | Vazio | Erro |
|--------|---------|-------|------|
| Agricultores (FarmersList) | Skeleton rows | "Nenhum registo encontrado" | Toast em mutations |
| Agricultores Completo (FarmersListComplete) | Skeleton rows | "Nenhum agricultor" | Toast em mutations |
| Producao (ProductionList) | Loader2 spinner | "Nenhum registo" + botao CTA | Toast em mutations |
| Cafe Lotes (CoffeeLotsTable) | Skeleton rows | Icone + "Nenhum lote" | Toast em mutations |
| Florestal Licencas (LicensesList) | Loader2 spinner | "Nenhuma licenca" | Toast em mutations |
| Florestal Arvores (TreesList) | Loader2 spinner | Icone + "Nenhuma arvore" | Toast em mutations |
| Florestal Toras (LogsList) | Loader2 spinner | Icone + "Nenhuma tora" | Toast em mutations |
| Florestal Guias Transporte | Spinner | Icone + "Nenhuma guia" | Toast em mutations |
| Florestal Denuncias | Query loading | "Nenhuma denuncia" | Toast em mutations |
| Mecanizacao Ordens | TableSkeleton | "Nenhuma ordem" | Toast |
| Mecanizacao Centros | TableSkeleton | "Nenhum centro" | Toast |
| Arroz Precos | Skeleton completo | "Sem dados de precos" | Toast |
| Arroz Alertas | Texto animado | Icone + "Nenhum alerta" | Toast |
| Data Lab Datasets | Texto loading | "Nenhum dataset" | Toast |
| Data Lab Organizacoes | Texto loading | "Nenhuma organizacao" | Toast |
| Data Lab Investigadores | Texto loading | "Nenhum investigador" | Toast |
| Credito Perfis Financeiros | Texto loading | "Nenhum perfil" | Toast |
| Credito Dossiês | Texto loading | Icone + "Nenhum dossie" | Toast |
| Incentivos Alocacoes | Texto loading | "Nenhuma alocacao" | Toast |
| Incentivos Programas | N/A (mock) | Icone + "Nenhum programa" | Toast |
| Risco Climatico Eventos | Texto loading | "Nenhum evento" | Toast |
| Ocorrencias | Skeleton | "Nenhuma ocorrencia" | Toast |
| IPN (Dashboard) | Skeleton inline | "Nenhum perfil" | Toast |

### LACUNA CRITICA: Nenhum modulo trata erro de query na UI

**Problema transversal**: Em TODOS os modulos, quando uma query falha (ex: API indisponivel, erro de rede), o React Query simplesmente para de fazer loading e o componente mostra o estado vazio — sem qualquer indicacao de que houve um erro. O utilizador ve "Nenhum registo encontrado" em vez de "Erro ao carregar dados".

Nenhum componente usa `isError` do React Query para mostrar uma mensagem de erro dedicada. Os erros de mutations sao tratados com `toast.error()`, mas falhas de **leitura** sao silenciosas.

### Modulos com lacunas especificas

| Modulo | Lacuna |
|--------|--------|
| **Seguros (InsurancePage)** | Loading: apenas para mutations; sem loading visual nas tabelas de apolices/sinistros/cotacoes quando vazias vs carregando |
| **ONAF (ExecutiveDashboard)** | Dados 100% mock — sem loading/erro real |
| **Reflorestamento** | Dados 100% mock — loading sempre `false` |
| **Simulador de Risco Climatico** | Mock — sem estados reais |
| **Incentivos Analytics** | KPIs/charts com `isLoading` prop mas dados possivelmente mock |
| **Mapa de Ocorrencias** | Tem erro de mapa mas sem retry UI |
| **Mapa Nacional ONAF** | Tem erro de mapa mas sem retry UI |

## Plano de Correccao Proposto

### 1. Criar componente reutilizavel `QueryStateHandler`
Novo componente `src/components/ui/query-state.tsx` que encapsula os 3 estados:
```
<QueryState isLoading={isLoading} isError={isError} error={error} isEmpty={!data?.length}>
  {/* conteudo normal */}
</QueryState>
```
- Loading: mostra Skeleton ou Loader configuravel
- Erro: mostra Card com icone de erro, mensagem em PT, e botao "Tentar novamente" (chama `refetch`)
- Vazio: mostra mensagem configuravel com icone

### 2. Aplicar aos modulos prioritarios (15 ficheiros)
Modulos com dados reais (nao mock) que precisam de tratamento de erro:
- FarmersList, FarmersListComplete
- ProductionList
- CoffeeLotsTable, CoffeeLotsDashboard
- LicensesList, TreesList, LogsList, TransportPermitsList
- ComplaintsDashboard
- InsurancePage
- ClimateEventsHistory
- OccurrencesList
- ServiceOrdersList, CentersList

### 3. Gerar relatorio PDF
`/mnt/documents/SIGAFLO_Auditoria_UI_Estados.pdf` com tabela completa.

## Ficheiros a Criar/Alterar
1. **Novo**: `src/components/ui/query-state.tsx`
2. **Alterar**: 15 componentes de listagem (adicionar tratamento de `isError`)
3. **Artefacto**: PDF de documentacao

