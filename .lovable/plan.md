# Módulo: Geração Automática do Cartão ID do Agricultor

Atualmente já existe `FarmerCard.tsx` (931 linhas) com layout CR-80, frente/verso, exportação PDF, duplex, guias de corte e pré-visualização. Este plano **estende** o que existe, adicionando ciclo de vida do cartão, QR público verificável, geração em lote, dashboard e auditoria — sem refazer o que já funciona.

## 1. Base de Dados (migração)

Nova tabela `farmer_cards` (1 ativo por agricultor + histórico de revogações):

- `id`, `farmer_id` (FK farmers)
- `card_status`: enum `rascunho | gerado | impresso | entregue | revogado`
- `qr_token` (texto único, 32 chars, gerado server-side, indexado UNIQUE)
- `serial` (sequencial CART-AAAA-NNNNNN via trigger)
- `issued_at`, `printed_at`, `delivered_at`, `revoked_at`, `revoked_reason`
- `issued_by`, `printed_by`, `delivered_by`, `revoked_by` (FK profiles)
- `snapshot` (jsonb com nome, província, cultura, área, score no momento da emissão — para reimpressão fiel)
- `version` (int, incrementa em cada regeneração)

Nova tabela `farmer_card_events` (log imutável):

- `card_id`, `event_type` (`generated | printed | delivered | revoked | reissued | qr_regenerated | scanned`), `actor_id`, `metadata` jsonb, `created_at`

RLS:

- Leitura: técnicos/admins respeitando jurisdição (reusar `can_access_province`/`can_access_municipality`)
- Escrita: apenas técnicos/admins (`is_technician_or_admin`)
- View pública `public.card_verification_view` com `security_invoker = on` expondo APENAS: nome, província, tipo de produtor, cultura principal, status (ativo/revogado), elegibilidade crédito/incentivo, última atualização — usada pela página `/verificacao/:qrToken` sem auth

Função SQL:

- `generate_card_serial()` trigger BEFORE INSERT
- `regenerate_card_qr(card_id)` SECURITY DEFINER — só técnicos, gera novo `qr_token`, incrementa `version`, regista evento `qr_regenerated`
- `revoke_card(card_id, reason)` — muda status, regista evento, mantém histórico
- Todas com `SET search_path = public`

Auditoria via trigger em `farmer_cards` que insere em `audit_log` (padrão SIGAFLO).

## 2. Hook `useFarmerCards`

`src/hooks/useFarmerCards.ts`:

- `useFarmerCard(farmerId)` — cartão ativo
- `useFarmerCardHistory(farmerId)` — histórico
- `useGenerateCard()` — cria cartão `gerado` com snapshot dos dados
- `useUpdateCardStatus()` — `gerado → impresso → entregue`
- `useRevokeCard()` — revogar com motivo
- `useRegenerateQR()` — chama RPC
- `useCardStats()` — para dashboard
- `useBatchGenerateCards(farmerIds[])` — gera N cartões + PDF agrupado

## 3. UI — Tab Cartão (extensão de FarmerCard.tsx)

Adicionar barra de estado acima do cartão:

- Badge do `card_status` com cores semânticas
- Botão **Gerar cartão** (se inexistente / rascunho)
- Botões **Marcar impresso**, **Marcar entregue**, **Revogar** (com diálogo de motivo)
- Botão **Regenerar QR** (com confirmação — invalida cartões físicos antigos)
- Histórico de eventos (timeline colapsável)

QR atual passa a usar `qr_token` real apontando para URL pública:
`https://{domain}/verificacao/{qr_token}`

## 4. Página pública de verificação

`src/pages/public/CardVerificationPage.tsx` em rota `/verificacao/:token` (sem auth, dentro de `PublicLayout`):

- Consulta `card_verification_view` por token
- Mostra: foto (se pública), nome, província/município, tipo, cultura principal, estado (Ativo/Revogado com cor), elegibilidade crédito, elegibilidade incentivo, "Última atualização"
- Estado vazio claro se token inválido / revogado
- Sem dados sensíveis (BI, telefone, email, coordenadas)
- Regista evento `scanned` (edge function leve, opcional)

## 5. Página de Cartões e Operação em Lote

`src/pages/farmers/CardsManagementPage.tsx` rota `/agricultores/cartoes`:

- Tabela paginada (server-side, padrão `usePaginatedQuery`) com filtros: estado, província, município, tipo
- Seleção massiva (checkboxes)
- Ações em lote: **Gerar cartões selecionados**, **Marcar impressos**, **Exportar PDF agrupado**
- Geração em lote usa Web Worker no cliente (jsPDF) iterando os agricultores selecionados, uma página A4 com 10 cartões CR-80 (5x2) com guias de corte
- Para >500 cartões: invoca edge function `generate-cards-batch` que processa em fila e devolve URL de download (Storage privado `card-exports`)

## 6. Edge Function `generate-cards-batch`

`supabase/functions/generate-cards-batch/index.ts`:

- Recebe array de `farmer_ids` + opções (formato A4/CR80, frente/verso)
- Valida JWT, valida jurisdição
- Cria registos em `farmer_cards` (status `gerado`)
- Gera PDF server-side com pdf-lib (suporta 300 DPI, embed PNGs do QR)
- Upload para bucket privado `card-exports`, devolve signed URL (24h)
- Suporta lotes grandes via processamento por chunks de 100 + retorno assíncrono com `job_id`

Nova tabela `card_export_jobs`: `id, requested_by, status (pending|processing|done|error), total, processed, file_path, created_at`

## 7. Dashboard de Cartões

Nova secção em `FarmersDashboard.tsx` (ou nova página `CardsDashboardPage`):

- KPIs: Total gerados, Ativos, Impressos, Entregues, Revogados
- Taxa de emissão por província (barras horizontais — reutiliza padrão Recharts)
- Taxa de entrega (gerados vs entregues)
- Cartões revogados últimos 30 dias

## 8. Storage

Bucket privado `card-exports` (PDFs em lote, signed URLs 24h).
Bucket existente `farmer-photos` (já público) é usado para a foto no cartão.

## 9. Segurança

- `qr_token`: 32 chars aleatórios via `gen_random_bytes(16)::text` (encode hex), UNIQUE
- Token nunca exposto em listagens — só na geração e no QR
- Página pública usa apenas a view sanitizada
- Logs de geração/impressão imutáveis em `farmer_card_events` + `audit_log`
- Regenerar QR exige confirmação dupla e revoga implicitamente cartões físicos anteriores (status anterior fica `revogado` com motivo "QR regenerado")

## 10. Performance (10.000+ cartões)

- Geração em lote >500: edge function assíncrona com job tracking
- Cliente faz polling do `card_export_jobs.status`
- PDF server-side com pdf-lib (streaming, memória controlada)
- Inserts em `farmer_cards` em batch (1 transação por chunk de 100)
- Índices: `farmer_cards(farmer_id, card_status)`, `farmer_cards(qr_token)`, `farmer_card_events(card_id, created_at)`

## Detalhes técnicos

```text
Fluxo de geração individual:
  UI (Tab Cartão) → useGenerateCard()
    → INSERT farmer_cards (status=gerado, qr_token=random, snapshot=...)
    → trigger gera serial CART-2026-NNNNNN
    → trigger insere audit_log + farmer_card_events
    → invalida queries → UI mostra cartão com QR real

Fluxo verificação pública:
  Cidadão escaneia QR → /verificacao/{token}
    → SELECT card_verification_view WHERE qr_token = token
    → mostra dados sanitizados + edge function regista scan (fire-and-forget)

Fluxo lote grande (>500):
  Seleção → POST edge fn generate-cards-batch → cria job → 202 + job_id
  Worker processa chunks → atualiza progresso → finaliza com signed URL
  UI faz polling → mostra progresso → botão Download
```

## Ficheiros a criar/editar

**Novos**

- Migração SQL (tabelas, view, funções, triggers, RLS, bucket)
- `src/hooks/useFarmerCards.ts`
- `src/pages/public/CardVerificationPage.tsx`
- `src/pages/farmers/CardsManagementPage.tsx`
- `src/components/farmers/CardStatusBar.tsx`
- `src/components/farmers/CardHistoryTimeline.tsx`
- `src/components/farmers/RevokeCardDialog.tsx`
- `src/components/farmers/BatchCardGenerator.tsx`
- `src/components/farmers/CardsDashboard.tsx`
- `supabase/functions/generate-cards-batch/index.ts`

**Editar**

- `src/components/farmers/FarmerCard.tsx` — usar `qr_token` real, integrar `CardStatusBar`
- `src/App.tsx` — rotas `/verificacao/:token` (pública) e `/agricultores/cartoes`
- `src/components/layout/Sidebar.tsx` — entrada "Cartões"
- `mem://index.md` + memórias relevantes

## Confirmação necessária

Antes de implementar, confirma:

1. **URL pública de verificação**: `/verificacao/{token}` (token aleatório) — preferes `/verificacao/{registration_number}` (mais legível mas menos seguro)?
2. **Geração em lote >500**: edge function assíncrona com job + signed URL — ok?
3. **Foto na página pública** de verificação: mostrar ou ocultar por privacidade?

# LAYOUT PRINT-READY (EXACTO)

## 📏 Dimensões finais

- **85.60 × 53.98 mm**
- Sangria: **3 mm**
- Ficheiro: **91.60 × 59.98 mm**

---

## 🎨 Frente (estrutura fixa)

### Zonas (proporção real):


| Zona           | Conteúdo              |
| -------------- | --------------------- |
| Esquerda (30%) | Foto                  |
| Centro (45%)   | Nome, ID, localização |
| Direita (25%)  | QR + cultura + área   |


---

## 🟫 Verso


| Zona   | Conteúdo            |
| ------ | ------------------- |
| Topo   | Código de barras    |
| Centro | NFC / ID            |
| Base   | Validade + contacto |


---

## 🖨️ Configuração gráfica

- 300 DPI
- CMYK
- Fontes bold (mín 8pt)
- QR mínimo: **20x20 mm**