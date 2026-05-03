## Problema

A página `/agricultores/cartoes` (`src/pages/farmers/CardsManagementPage.tsx`) é renderizada **sem `MainLayout`**, ao contrário do resto do sistema (ex.: `FarmersListPage`, `FarmerDetailPage`). Resulta:

- Sem sidebar, sem header, sem breadcrumbs — parece uma página "órfã".
- Sem acesso ao perfil do agricultor, ao QR público, ao histórico de auditoria ou às notificações.
- Sem paginação real (corta arbitrariamente em 200 linhas) nem filtro por município.
- Sem `QueryState` para estados de loading/erro/vazio (padrão SIGAFLO).

## Plano de integração

### 1. Layout consistente (`MainLayout`)
- Envolver o conteúdo em `<MainLayout title="Gestão de Cartões" subtitle="Geração, impressão, entrega e auditoria">`.
- Remover o cabeçalho duplicado (`CreditCard + h1`) — passa a viver no header global.
- Remover `p-6` interno (já aplicado pelo MainLayout).

### 2. Ações por linha (ligação ao agricultor)
Adicionar coluna **Ações** com:
- **Ver perfil** → `NavLink` para `/agricultores/{id}` (abre `FarmerDetailPage` no separador "Cartão").
- **Verificar QR** → abre `/verificar-cartao/{qr_token}` em nova aba (verificação pública existente).
- **Imprimir** → reutiliza `FarmerCard` em modal (componente já preparado para `PrintPreviewDialog` + `DuplexAlignmentWizard`).
- **Revogar / Regenerar QR** → menu kebab usando `useRevokeCard` e `useRegenerateQR` já existentes em `useFarmerCards.ts`.
- **Histórico** → drawer lateral mostrando `useFarmerCardHistory` (eventos generated/printed/delivered/revoked/scanned).

### 3. Ligações cruzadas
- Botão **"Notificar agricultor"** (sino) que cria notificação via `useNotifications` quando o cartão fica `gerado` ou `impresso`.
- Botão **"Auditoria"** no header da página → navega para `/admin/auditoria?entity=farmer_cards` (filtro pré-aplicado).
- Card de KPI "Verificações públicas hoje" alimentado por `farmer_card_events` (event_type=`scanned`).
- Link no painel de KPIs "Sem cartão" → aplica filtro `statusFilter=sem_cartao` automaticamente.

### 4. Paginação + filtro de município
- Substituir o `useFarmers` cliente + `slice(0, 200)` por **`usePaginatedQuery`** (padrão SIGAFLO em `src/hooks/usePagination.ts`) consumindo a query Supabase com `range()`.
- Adicionar **filtro em cascata Província → Município** usando `useLocationCascade`.
- Adicionar `<PaginationControls />` no rodapé da tabela.
- Mover o `cardsMap` para uma query paralela limitada à página visível (evita carregar todos os cartões).

### 5. UX padrão
- Substituir o estado de loading custom por `<QueryState isLoading isError isEmpty>` (padrão `src/components/ui/query-state.tsx`).
- Skeleton loader na tabela enquanto carrega (consistente com `FarmersListPage`).
- Mobile: ações colapsam em menu kebab; tabela usa scroll horizontal.

## Diagrama de navegação

```text
                ┌─────────────────────────┐
                │ /agricultores/cartoes   │  (MainLayout + sidebar)
                └────────────┬────────────┘
                             │
   ┌─────────────┬───────────┼───────────┬──────────────┐
   ▼             ▼           ▼           ▼              ▼
Ver perfil   Imprimir   Verificar QR  Histórico    Notificar
/agric/:id   FarmerCard /verificar    Drawer       useNotif.
             dialog     -cartao/:tok  audit events
```

## Ficheiros previstos

- **edit** `src/pages/farmers/CardsManagementPage.tsx` — refactor completo (MainLayout, paginação, ações).
- **new** `src/components/farmers/CardActionsMenu.tsx` — menu kebab por linha (imprimir/revogar/regenerar/notificar).
- **new** `src/components/farmers/CardHistoryDrawer.tsx` — drawer com timeline de eventos.
- **edit** `src/components/layout/Sidebar.tsx` — garantir destaque do item "Cartões ID" quando ativo (já existe, só validar).

## Fora de âmbito

- Mudanças de schema na BD (já existe tudo: `farmer_cards`, `farmer_card_events`, RPCs `revoke_farmer_card`, `regenerate_card_qr`, view `card_verification_view`).
- Redesenho do `FarmerCard` ou do wizard duplex (já feitos).
- Alterações no fluxo de exportação em lote (`CardBatchExportDialog` permanece igual).
