## Redesign do Cartão de Identificação do Agricultor (SIGAFLO)

Aplicar o novo padrão visual ao componente `FarmerCard` (preview 3D), aos templates de impressão (HTML PVC/A4) e à geração em lote (`cardBatchExport.ts`), garantindo consistência total entre preview digital, PDF print-ready e exportação em massa.

### 1. Frente — layout institucional em 3 zonas

Substituir o layout actual (foto+info+chip dourado) por uma grelha rígida 30/45/25 dentro da safe-zone de 3 mm:

```text
┌─ HEADER (faixa verde 6mm) ─────────────────────────────┐
│ República de Angola · MINAGRIF        [SIGAFLO wordmark]│
├──────────┬───────────────────────┬─────────────────────┤
│          │ NOME COMPLETO (11pt)  │   ▢ QR (22×22 mm)   │
│  FOTO    │ ID SIGAF (bold mono)  │                     │
│ 25×32 mm │ Tipo de produtor      │   Cultura principal │
│  (cinza) │ Província/Município/  │   Área: X.X ha      │
│          │ Comuna                │                     │
└──────────┴───────────────────────┴─────────────────────┘
```

- Reduzir gradientes: fundo branco com faixa institucional verde no topo (6 mm) e rodapé fino (1.5 mm). Eliminar o padrão guilloché agressivo da frente; substituir por marca-d’água SIGAFLO discreta (≤ 6% opacidade) no fundo branco.
- Foto com moldura cinza neutro (sem dourado), 25×32 mm.
- Nome em uppercase 11pt bold; ID SIGAF em mono 10pt bold verde institucional; subtítulos em 7pt cinza-700.
- QR movido para a frente (zona 3) com mínimo 20×20 mm — exigido pelo brief para leitura rápida.
- Remover chip PVC simulado e badge "Verificado/Pendente" da frente (ruído visual); estado migra para o verso.

### 2. Verso — estrutura clara

```text
┌────────────────────────────────────────────────┐
│ ▮▮▮▮▮▮▮ Code128: ID SIGAF        SIGAFLO logo │
├────────────────────────────────────────────────┤
│ Estado: ●ACTIVO    NFC: ⌬ disponível          │
│ BI/NIF · Telefone · Área total                 │
├────────────────────────────────────────────────┤
│ Emissão: dd/mm/aaaa   │ Nota legal:           │
│ Validade: dd/mm/aaaa  │ Documento intransmis- │
│ ☎ 923 000 000         │ sível. Uso institucio-│
│ sigaflo.gov.ao        │ nal. Devolver ao MINAG│
└────────────────────────────────────────────────┘
```

- Adicionar `jsbarcode` (ou render SVG manual Code128) para o código de barras topo.
- Indicador NFC textual "⌬ NFC" (apenas badge — sem hardware real).
- Pílula `ACTIVO/INACTIVO/REVOGADO` com cor semântica (verde/cinza/vermelho).
- Datas obtidas de `activeCard.issued_at` e regra de validade (default: 5 anos).
- Nota legal compactada à direita, 5pt.

### 3. Paleta e tipografia (design tokens)

Adicionar ao `index.css` / `tailwind.config.ts` tokens dedicados (HSL):

- `--card-sigaflo-green`: hsl(142 72% 22%) — verde institucional dominante
- `--card-sigaflo-green-dark`: hsl(142 80% 14%) — faixa header
- `--card-sigaflo-gold`: hsl(45 90% 55%) — apenas detalhe selo (1 linha)
- `--card-sigaflo-surface`: hsl(0 0% 100%) — fundo principal
- `--card-sigaflo-muted`: hsl(220 14% 96%) — fundo foto/secções
- `--card-sigaflo-text`: hsl(220 13% 18%)

Tipografia: Inter (já presente). Hierarquia: Nome 11pt/700, ID 10pt/700 mono, dados 7.5pt/500, labels 6pt/600 uppercase.

### 4. Compatibilidade print-ready

- Manter `@page 85.6mm 53.98mm`, margem 0, com safe-zone CSS de 3 mm (padding interno).
- Adicionar guias visuais opcionais de sangria (3 mm) para o modo PVC no preview de impressão.
- Forçar `print-color-adjust: exact`. Usar apenas cores sólidas (sem gradientes complexos) → melhor conversão para CMYK em RIPs externos.
- Render `html2canvas` aumentado para `scale: 5` (~300 DPI em 85.6 mm).

### 5. Versão digital (preview 3D)

- Refazer JSX da frente/verso em `FarmerCard.tsx` espelhando exactamente o template HTML para evitar discrepâncias entre preview e PDF.
- Manter flip 3D, mas remover o badge dourado e overlay "Rascunho" → mover para `CardStatusBar`.
- Mobile: garantir que o card (380×240 px) escala com `max-w-full` e `aspect-[1.586]`.

### 6. Exportação em lote

Actualizar `src/lib/cardBatchExport.ts` (`drawCardFront` e `drawCardBack`) com o mesmo layout 30/45/25, código de barras no verso, paleta institucional e tipografia. Manter compatibilidade com `BatchExportOptions` actual.

### 7. Template reutilizável

Extrair o markup HTML do cartão para `src/lib/cardTemplate.ts` exportando `renderCardFrontHtml(ctx)` e `renderCardBackHtml(ctx)` reutilizado por:
- `FarmerCard.tsx` (impressão single)
- futuras integrações (e-mail, partilha pública)

### Ficheiros a alterar

- `src/components/farmers/FarmerCard.tsx` — preview 3D + `buildPrintHtml`
- `src/lib/cardTemplate.ts` — **novo**, markup partilhado
- `src/lib/cardBatchExport.ts` — sincronizar `drawCardFront`/`drawCardBack`
- `src/index.css` + `tailwind.config.ts` — tokens `--card-sigaflo-*`
- `package.json` — adicionar `jsbarcode`

### Validação final

- Preview digital idêntico ao PDF gerado (frente + verso).
- QR ≥ 20 mm, código de barras legível.
- Nenhum elemento crítico fora da safe-zone de 3 mm.
- Contraste WCAG AA em todos os textos sobre verde/branco.
- Geração em lote (A4 grid e CR80) usa o mesmo layout.
