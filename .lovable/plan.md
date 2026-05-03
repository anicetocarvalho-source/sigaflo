## Problema

O diálogo aberto a partir do botão **Imprimir / Download** (`src/components/farmers/FarmerCard.tsx`, linhas 442–632) acumula 5 secções verticais (Formatos PVC/A4, Duplex + ajuste fino X/Y, Guias de corte A4 e PVC, Export PDF, Footer) dentro de um `DialogContent` com largura por defeito (`max-w-lg`, ~512 px) e sem scroll. Resultado: textos saem fora dos cards e o conteúdo transborda na viewport.

Existe também um warning no console (`DialogFooter` recebe ref sem `forwardRef`) que aparece sempre que o diálogo monta.

## Solução proposta

Reorganizar o diálogo em **abas** (Tabs do shadcn) para reduzir altura, alargar para `max-w-2xl` e adicionar scroll interno como salvaguarda. Sem mudar comportamento de impressão/exportação.

### Layout novo

```text
┌─ Imprimir cartão ────────────────────────────┐
│  [ Formato ] [ Calibração ] [ Guias de corte ] │
│ ────────────────────────────────────────────── │
│  (conteúdo da aba activa, scrollável)         │
│                                                │
│  ── Exportar para PDF ──                       │
│  [ PDF PVC ]  [ PDF A4 ]                       │
│                                                │
│                          [ Cancelar ]          │
└────────────────────────────────────────────────┘
```

- **Aba "Formato"** — os 2 cards PVC e A4 (pré-visualizar / imprimir), em grid 2 colunas estável.
- **Aba "Calibração"** — modo duplex + sliders X/Y + repor (só visível se duplex ≠ simplex).
- **Aba "Guias de corte"** — checkboxes e sliders para A4 e PVC.
- **Rodapé fixo** — bloco "Exportar para PDF" + botão Cancelar (sempre visíveis, não dentro das abas).

### Alterações de CSS / estrutura

- `DialogContent` → adicionar `className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"`.
- Wrapper das abas → `flex-1 overflow-y-auto pr-1`.
- Garantir gaps consistentes (`space-y-3`) e remover `border-t pt-3` redundantes (já separados pelas tabs).
- Manter todos os labels, sliders e estado/`localStorage` exactamente como hoje — apenas reagrupar.

### Correção do warning React

Em `src/components/ui/dialog.tsx`, `DialogFooter` é um function component normal mas o Radix injecta refs em alguns contextos. Envolver com `React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>` para silenciar o warning sem mudar API.

## Ficheiros afectados

- `src/components/farmers/FarmerCard.tsx` — apenas o JSX do `<Dialog open={printDialogOpen}>` (linhas 442–632). Lógica (`buildPrintHtml`, `openPrintWindow`, `exportPdf`, estado) intocada.
- `src/components/ui/dialog.tsx` — converter `DialogFooter` (e por consistência `DialogHeader`) em `forwardRef`.

## Fora do âmbito

- Não mexe em `cardTemplate.ts`, `cardBatchExport.ts`, nem na pré-visualização 3D.
- Não altera o fluxo de impressão, duplex, calibração ou geração de PDF.
- Não altera a página `/dev/print-test` nem o `PrintPreviewDialog`.

## Verificação

1. Navegar a `/agricultores/:id?tab=card`, clicar **Imprimir / Download** → diálogo abre sem overflow em viewport 1394×830 e em 768 px.
2. Trocar entre as 3 abas — cada secção mantém os controlos com estado preservado.
3. Imprimir/Exportar PDF nos modos PVC e A4 — comportamento idêntico ao actual.
4. Console — sem warning de `forwardRef` ao abrir/fechar o diálogo.
