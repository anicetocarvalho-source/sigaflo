# Suporte Offline-First com Sincronização Híbrida

## Objectivo
Permitir que o SIGAFLO funcione sem rede (cadastro, POS, ocorrências e consulta geral) e sincronize automaticamente quando a conexão regressa, mantendo um indicador visível da fila pendente.

## Arquitectura

### 1. PWA Instalável
- Instalar `vite-plugin-pwa` com `registerType: autoUpdate`
- Manifest com nome **SIGAFLO**, ícones (192/512), `display: standalone`, cor de tema institucional
- Service worker com estratégia:
  - `NetworkFirst` para HTML e chamadas Supabase (com fallback para cache)
  - `CacheFirst` para assets estáticos (JS/CSS/imagens/fontes)
  - `navigateFallbackDenylist`: `/~oauth`, `/auth/callback`
- Guard de iframe/preview para não registar SW em ambiente Lovable
- Aviso ao utilizador: PWA só funciona em produção (sigaflo.lovable.app)

### 2. Camada Offline (IndexedDB via Dexie)
Novo `src/lib/offline/db.ts` com 3 stores:
- **cache**: snapshot de queries (chave = queryKey, valor = dados + timestamp)
- **mutationQueue**: operações pendentes (`{id, type, table, payload, createdAt, retries, error}`)
- **assets**: ficheiros pendentes (fotos BI, biometria) em base64

### 3. Hook `useOfflineQuery` e `useOfflineMutation`
- `useOfflineQuery`: wrapper sobre React Query que:
  - Hidrata cache do IndexedDB no `initialData`
  - Persiste cada resposta bem-sucedida no IndexedDB
  - Marca dados como `stale` quando vêm do cache offline
- `useOfflineMutation`: wrapper sobre `useMutation` que:
  - Se online → executa normalmente
  - Se offline → adiciona à `mutationQueue`, mostra toast "Guardado offline", retorna optimistic id

### 4. Sync Engine (`src/lib/offline/syncEngine.ts`)
- Listener `window.addEventListener('online'/'offline')`
- Ao voltar online: processa fila por ordem cronológica, com retry exponencial (3 tentativas)
- Conflitos: estratégia `last-write-wins` no servidor; falhas permanentes ficam visíveis para revisão manual
- Invalida queries do React Query após cada sync bem-sucedido

### 5. UI de Estado de Conexão
Novo `src/components/layout/OfflineIndicator.tsx` no Header:
- Badge persistente: 🟢 Online / 🟡 Sincronizando (X) / 🔴 Offline (X pendentes)
- Click abre Popover com:
  - Lista das mutations pendentes (tipo, módulo, hora)
  - Botão "Sincronizar agora" (força flush)
  - Botão "Descartar" por item em caso de erro permanente
- Toast automático ao voltar online: "Conexão restaurada, sincronizando N itens..."

### 6. Módulos Prioritários Adaptados
Aplicar `useOfflineMutation` em:
- **Cadastro de Campo** (`FieldRegistrationPage`, `useCreateFarmer`)
- **POS** (`usePOS` — vendas, recibos, hash chain mantém-se válida offline)
- **Ocorrências** (`useCreateOccurrence`, `ReportOccurrenceForm`)
- **Parcelas/Biometria** (uploads ficam em fila no `assets` store)

E `useOfflineQuery` nos hooks de leitura mais usados:
- `useFarmers`, `useProvinces/Municipalities/Communes`, `useProductionRecords`, `useOccurrences`

### 7. Persistência do React Query
Adicionar `@tanstack/query-sync-storage-persister` + `persistQueryClient` para que o cache da última sessão sobreviva a recarregamentos sem rede.

## Ficheiros a Criar
- `vite.config.ts` (alterar — adicionar VitePWA)
- `public/manifest.webmanifest` + ícones (192, 512, maskable)
- `index.html` (alterar — meta tags PWA, theme-color)
- `src/lib/offline/db.ts` (Dexie schema)
- `src/lib/offline/syncEngine.ts`
- `src/lib/offline/useOfflineQuery.ts`
- `src/lib/offline/useOfflineMutation.ts`
- `src/lib/offline/queryPersister.ts`
- `src/components/layout/OfflineIndicator.tsx`
- `src/components/layout/Header.tsx` (alterar — incluir indicador)
- `src/main.tsx` (alterar — registar SW com guard, montar persister)

## Ficheiros a Adaptar (mutations críticas)
- `src/hooks/useFarmers.ts`
- `src/hooks/usePOS.ts`
- `src/hooks/useOccurrences.ts`
- `src/hooks/useProductionHistory.ts`

## Dependências a Instalar
- `vite-plugin-pwa`
- `dexie`
- `@tanstack/query-sync-storage-persister`
- `@tanstack/react-query-persist-client`

## Notas Importantes
- **Auth**: token Supabase já persiste em `localStorage`; sessão sobrevive offline
- **RLS**: mutations offline só sincronizam com sucesso se o utilizador continuar autenticado e tiver permissão — caso contrário ficam na fila com erro visível
- **Limites**: IndexedDB tem ~50MB por origem; assets grandes (>5MB) já são bloqueados pela validação Zod existente
- **Preview Lovable**: SW desactivado dentro do iframe; testar offline na URL publicada (`sigaflo.lovable.app`)
- **Memória**: actualizar `mem://features/offline-contingency-support` com a nova arquitectura