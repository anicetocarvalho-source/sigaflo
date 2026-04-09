

# Módulo Agricultores — Análise e Plano de Actualização do Cartão

## Estado Actual vs. Especificação

| Funcionalidade | Estado | Gap |
|---|---|---|
| Listagem com filtros, pesquisa, paginação | ✅ Existe | — |
| Formulário multi-tab (5 tabs) | ✅ Existe | Falta validação de BI duplicado |
| Perfil com 16+ tabs (scroll horizontal) | ✅ Existe | — |
| Workflow de validação (draft→issued) com RBAC | ✅ Existe | — |
| Representantes CRUD | ✅ Existe | — |
| Parcelas CRUD + mapa | ✅ Existe | Falta leaflet-draw para polígonos editáveis |
| Campanhas produtivas (10 fases) | ✅ Existe | — |
| AgroPay, Compras, Biometria, Previsão tabs | ✅ Existe | — |
| Cadastro de Campo mobile (`/cadastro-campo`) | ✅ Existe | Falta IndexedDB offline real |
| Acesso Externo (`/cadastro-externo`) | ✅ Existe | — |
| Parcelas listagem (`/parcelas`) | ✅ Existe | — |
| **Cartão CR-80 com flip 3D (frente + verso)** | ❌ Parcial | Cartão actual é flat, sem verso, sem flip |
| **QR com payload JSON (não URL)** | ❌ Não | QR actual contém URL de verificação |
| **Hierarquia: Angola → Ministério → ONAPA** | ❌ Parcial | Mostra "MINAGRIP" mas não "ONAPA" |
| **BI formatado (0001 2345 6789)** | ❌ Não | BI mostrado sem formatação |
| **Badge biometria (Verificado/Pendente)** | ❌ Não no cartão | — |
| **Verso com BI, Telefone, Nascimento, Género** | ❌ Não existe | Cartão actual é apenas frente |
| **Exportação PDF em lote (A4, 3×3 grid)** | ❌ Não existe | Apenas exportação individual |
| **Provisionamento automático ao criar** | ❌ Não existe | — |
| **Duplicação de BI cross-check** | ❌ Não existe | — |

---

## Plano de Implementação

### 1. Novo Cartão do Agricultor com Flip 3D (`FarmerCard.tsx`)

Reescrever completamente o componente `FarmerCard.tsx` para seguir a especificação:

**Frente (CR-80, 86×54mm):**
- Hierarquia: "República de Angola" → "Ministério da Agricultura e Pescas" → "ONAPA"
- Foto ou iniciais com fundo colorido
- Nome, BI formatado (`0001 2345 6789` com espaços a cada 4 dígitos)
- Província/Município, Área total, Culturas (chips)
- Badge biometria (Verificado ✅ / Pendente ⏳)

**Verso:**
- BI, Telefone, Data Nascimento, Género
- QR Code SVG com payload JSON:
```json
{
  "plataforma": "ONAPA",
  "id": "uuid",
  "nome": "...",
  "bi": "...",
  "provincia": "...",
  "municipio": "..."
}
```

**Interacção:**
- Click no cartão faz flip 3D (CSS `transform: rotateY(180deg)` com `perspective`)
- Botões de Imprimir e Download PDF

### 2. Actualizar Tab Cartão no Perfil (`FarmerProfileComplete.tsx`)

Substituir o cartão inline actual (linhas 903-1093) pelo novo componente `FarmerCard` com flip 3D, para individual/family. Manter os certificados de cooperativa/escola/empresa como estão.

### 3. Exportação PDF em Lote (nova utilidade)

Adicionar ao `FarmersListComplete.tsx`:
- Checkbox de selecção múltipla + toggle "selecionar todos"
- Botão "Exportar Cartões PDF" que gera:
  - A4 landscape (297×210mm)
  - Grid 3×3 = 9 cartões/página
  - Página 1: frentes → Página 2: versos (espelhados para impressão frente-verso)
  - Barra de progresso (x/total)
- Dependências: `html2canvas` + `jsPDF`

### 4. Validação de BI Duplicado (`FarmerForm.tsx`)

Adicionar verificação ao sair do campo BI:
- Query Supabase para verificar se BI já existe em `farmers` ou `farmer_representatives`
- Se duplicado: mostrar alerta com nome do registo existente e bloquear submit

---

## Ficheiros

| Ficheiro | Acção |
|---|---|
| `src/components/farmers/FarmerCard.tsx` | Reescrever — flip 3D, frente/verso, QR JSON, BI formatado |
| `src/components/farmers/FarmerProfileComplete.tsx` | Actualizar tab "Cartão" para usar novo `FarmerCard` |
| `src/components/farmers/FarmersListComplete.tsx` | Adicionar selecção múltipla + botão exportação PDF lote |
| `src/components/farmers/FarmerForm.tsx` | Adicionar validação BI duplicado |
| `src/lib/farmerCardExport.ts` | Novo — lógica de exportação PDF em lote (html2canvas + jsPDF) |

## Prioridade
1. **Cartão flip 3D** (impacto visual directo, pedido explícito)
2. **Tab Cartão no perfil** (dependência do ponto 1)
3. **Validação BI duplicado** (integridade de dados)
4. **Exportação PDF em lote** (funcionalidade operacional)

