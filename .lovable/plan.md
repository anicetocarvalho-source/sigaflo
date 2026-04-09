

# Módulo de Vendas & POS + Módulo Sistema — Implementação Completa

## Resumo

Implementação completa do módulo de Vendas/POS (Ponto de Venda, Faturas AGT, Compras Subsidiadas, Pacotes de Compras) e melhorias ao módulo Sistema (gateway de pagamentos nas configurações, contas demo melhoradas). Inclui tabelas de base de dados, RLS, contextos React, e 4 páginas principais.

---

## Fase 1 — Base de Dados (SQL Migration)

### Novas tabelas:
1. **`pos_products`** — catálogo de produtos POS (nome, categoria, preço, iva_rate, unidade, stock, isento)
2. **`farmer_wallets`** — carteira digital por agricultor (saldo, pin_hash, farmer_id FK)
3. **`pos_sales`** — vendas realizadas (farmer_id, total, iva_total, payment_method, status, representative_name, representative_bi, hash_fiscal, hash_anterior, qr_data)
4. **`pos_sale_items`** — itens de cada venda (sale_id, product_id, quantity, unit_price, iva_value, subtotal)
5. **`invoices`** — facturas AGT (invoice_number, series_code [FE/FR/NC], sale_id, status [emitida/pendente/comunicada/aceite/rejeitada], hash_fiscal, hash_anterior, system_id, xml_data)
6. **`invoice_series`** — séries fiscais (code, last_number, is_active)
7. **`subsidized_purchases`** — compras subsidiadas (farmer_id, supplier, product, total_value, subsidy_value, copayment_value, status, purchase_package_id, deferred_payment)
8. **`purchase_packages`** — pacotes de compras (farmer_id, campaign, status, province_id, municipality_id)
9. **`purchase_package_items`** — itens do pacote (package_id, product_id, max_quantity)
10. **`payment_gateway_config`** — configurações de gateway (provider, config_json, is_active)

### Enums:
- `invoice_status`: emitida, pendente, comunicada, aceite, rejeitada
- `invoice_series_type`: FE, FR, NC
- `payment_method`: agropay, unitel_money, deferred
- `purchase_status`: pending, approved, rejected, completed

### RLS:
- Todas as tabelas com RLS habilitado
- Técnicos e admins: CRUD completo (via `is_technician_or_admin`)
- Viewers/private_entity: apenas SELECT
- `farmer_wallets`: acesso restrito ao titular + admins

### Triggers:
- Auto-geração de `invoice_number` sequencial por série (INV-FE-2026-000001)
- `updated_at` automático em todas as tabelas

---

## Fase 2 — Contextos React (3 ficheiros)

### `src/contexts/WalletContext.tsx`
- Estado da carteira do agricultor seleccionado
- Operações: débito, crédito, splitCredit (banco/agricultor)
- Validação de PIN (SHA-256 client-side comparison)
- Query/mutation via Supabase `farmer_wallets`

### `src/contexts/ComprasContext.tsx`
- CRUD de compras subsidiadas
- `aprovarComDebito()` — para mecanização (pagamento diferido)
- Split automático 70/30 subsídio/copagamento
- Validação de quota do pacote

### `src/contexts/PacotesContext.tsx`
- Gestão de pacotes activos
- Cálculo de quota restante (subtrai compras Aprovadas + Pendentes)
- Reforço de pacotes

---

## Fase 3 — Páginas (4 páginas + sub-componentes)

### 3.1 — POS `/pos` (~8 sub-componentes)
Fluxo guiado em etapas (stepper):

1. **FarmerSearch** — pesquisa por nome/BI, toggle "compra por representante" (campos: nome, BI, parentesco)
2. **FarmerValidation** — verifica status (Ativo ok, Suspenso/Rascunho bloqueado com visual grayscale + mensagem)
3. **ProductGrid** — grelha filtrada por categoria, mostra quota restante por produto, botão "Adicionar"
4. **CartPanel** — painel lateral fixo (desktop) / Sheet (mobile); quantidade com min/max, subtotal por linha, IVA 14%, total
5. **PaymentStep** — selecção de método:
   - AgroPay: input PIN 4 dígitos, validação, débito na wallet
   - Unitel Money: selecção telefone (principal/alternativo), confirmação simulada
   - Diferido (Mecanização): aviso visual "⏳ Pagamento pendente", registo sem débito
6. **ReceiptModal** — recibo com QR, dados fiscais (hash SHA-256, SystemId AGROPY-POS-001), botão imprimir, saldo actualizado

### 3.2 — Faturas `/faturas`
- KPIs: total emitido (AOA), total IVA, nº facturas
- Tabela pesquisável com filtros de estado
- Detalhe da factura: linhas, totais, hash fiscal actual + anterior, QR placeholder
- Séries fiscais (FE/FR/NC) com numeração sequencial
- Log de auditoria imutável (utilizador, acção, timestamp, IP) — consulta à tabela `audit_log` existente
- Botões download simulado PDF/XML

### 3.3 — Compras `/compras`
- KPIs: total compras, valor subsidiado, copagamento total
- Tabela com aprovação/rejeição por compra
- Formulário nova compra com validação de quota do pacote
- Split automático 70/30
- Integração com fornecedores e pacotes

### 3.4 — Pacotes de Compras `/pacotes-compras`
- CRUD individual + atribuição em massa (bulk assign)
- Filtros por província/município/cultura/estado
- Editor de produtos com quantidade máxima por item
- Relatório consolidado por província (charts + export CSV)

---

## Fase 4 — Sistema (actualizações)

### 4.1 — Configurações `/configuracoes` (adicionar tabs)
- **Gateway de Pagamentos**: configuração Unitel Money (sandbox/prod, chaves, callback, shortCode) + Cartão (provedor, merchantId, apiKey)
- Toggle activo/inactivo, teste de conexão simulado
- Campos sensíveis com máscara (mostrar/ocultar)

### 4.2 — Sidebar + Rotas
- Adicionar secção "Vendas & POS" na sidebar com sub-itens: POS, Faturas, Compras, Pacotes
- Adicionar secção "Gateway" nas configurações
- Novas rotas protegidas em `App.tsx` (TECHNICIAN_AND_ADMIN para POS/Faturas/Compras, ADMIN para Pacotes)

---

## Compliance Fiscal AGT

- IVA 14% com regime de isenção (flag `isento` no produto)
- Hash SHA-256 encadeado: cada factura gera hash = SHA-256(invoice_number + total + date + hash_anterior)
- SystemID fixo: `AGROPY-POS-001`
- Séries FE (Factura Electrónica), FR (Factura-Recibo), NC (Nota de Crédito)
- Suporte a modo offline (flag `offline` na factura, sincronização posterior)

---

## Ficheiros a Criar (~25)

| Ficheiro | Tipo |
|---|---|
| Migration SQL (1 grande) | DB |
| `src/contexts/WalletContext.tsx` | Context |
| `src/contexts/ComprasContext.tsx` | Context |
| `src/contexts/PacotesContext.tsx` | Context |
| `src/pages/pos/POSPage.tsx` | Page |
| `src/components/pos/FarmerSearch.tsx` | Component |
| `src/components/pos/FarmerValidation.tsx` | Component |
| `src/components/pos/ProductGrid.tsx` | Component |
| `src/components/pos/CartPanel.tsx` | Component |
| `src/components/pos/PaymentStep.tsx` | Component |
| `src/components/pos/ReceiptModal.tsx` | Component |
| `src/pages/pos/FaturasPage.tsx` | Page |
| `src/components/pos/InvoiceDetail.tsx` | Component |
| `src/components/pos/InvoiceKPIs.tsx` | Component |
| `src/pages/pos/ComprasPage.tsx` | Page |
| `src/components/pos/CompraForm.tsx` | Component |
| `src/components/pos/CompraKPIs.tsx` | Component |
| `src/pages/pos/PacotesComprasPage.tsx` | Page |
| `src/components/pos/PacoteEditor.tsx` | Component |
| `src/components/pos/PacotesBulkAssign.tsx` | Component |
| `src/components/pos/PacotesReport.tsx` | Component |
| `src/hooks/usePOS.ts` | Hook |
| `src/lib/fiscal.ts` | Util (hash SHA-256, séries) |

## Ficheiros a Editar (~3)

| Ficheiro | Alteração |
|---|---|
| `src/App.tsx` | Novas rotas `/pos`, `/faturas`, `/compras`, `/pacotes-compras` |
| `src/components/layout/Sidebar.tsx` | Secção "Vendas & POS" |
| `src/pages/settings/SettingsPage.tsx` | Tab "Gateway de Pagamentos" |

