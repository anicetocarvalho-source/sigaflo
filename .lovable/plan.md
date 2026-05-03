## Objetivo

Substituir o brasão SVG inline (atualmente desenhado em `src/lib/cardTemplate.ts` como `brasaoSvg`) pela insígnia oficial da República de Angola fornecida (`user-uploads://insignia.png`), no canto superior esquerdo do Cartão do Agricultor (frente).

## Passos

1. **Copiar o asset para o projeto**
   - `code--copy user-uploads://insignia.png` → `src/assets/insignia-angola.png`
   - Mantém o ficheiro versionado e otimizável pelo bundler.

2. **Disponibilizar a insígnia para os 3 renderizadores do cartão**
   O cartão é renderizado em três sítios e todos têm de ficar visualmente idênticos:
   - `src/lib/cardTemplate.ts` — template HTML usado na impressão/PDF de cartão único.
   - `src/components/farmers/FarmerCard.tsx` — pré-visualização React no perfil do agricultor (separador "Cartão").
   - `src/lib/cardBatchExport.ts` — geração em lote via jsPDF.

3. **Alterações em `src/lib/cardTemplate.ts`**
   - Remover a constante `brasaoSvg` (SVG estilizado atual).
   - Substituir, em `renderCardFrontHtml`, o `<div class="brasao">${brasaoSvg}</div>` por `<div class="brasao"><img src="${insigniaUrl}" alt="Brasão da República de Angola" /></div>`.
   - Aceitar `insigniaUrl` via parâmetro do contexto (`CardTemplateCtx`) ou import direto do asset (preferencial: import ESM para o Vite resolver o hash do ficheiro).
   - Ajustar CSS `.sigaflo-card.front .header .gov .brasao img { width:100%; height:100%; object-fit:contain; }` para a imagem ocupar bem o quadrado de 7×7 mm sem distorção.

4. **Alterações em `src/components/farmers/FarmerCard.tsx`**
   - Importar `insignia` de `@/assets/insignia-angola.png`.
   - Trocar o SVG inline do brasão (no header da face frontal) por `<img src={insignia} alt="Brasão de Angola" className="w-full h-full object-contain" />`.

5. **Alterações em `src/lib/cardBatchExport.ts`**
   - Carregar a insígnia como dataURL (via `fetch(insigniaUrl).then(r => r.blob())` ou import + `new Image()`), e desenhá-la com `pdf.addImage(...)` no canto superior esquerdo (mesma posição/tamanho que o SVG anterior).
   - Garantir que a imagem é pré-carregada antes do `addImage` para não falhar em batch.

6. **QA visual obrigatório**
   - Abrir o perfil do agricultor → separador "Cartão" e confirmar a nova insígnia na frente.
   - Abrir "Pré-visualizar para impressão" e validar que a frente mostra a insígnia (sem distorção, dentro do safe area).
   - Gerar 1 PDF único e 1 PDF em lote (2 cartões) e inspecionar a primeira página de cada via screenshot.
   - Verificar verso intacto (não deve mudar).

## Fora de âmbito

- Layout do resto do header (logo SIGAFLO ao centro, mapa+tag à direita) permanece igual.
- Verso do cartão não muda.
- Sem alterações de schema, hooks ou fluxos de dados.

## Ficheiros previstos

- **new** `src/assets/insignia-angola.png` (cópia do upload)
- **edit** `src/lib/cardTemplate.ts` (remover SVG inline, usar `<img>`, ajustar CSS)
- **edit** `src/components/farmers/FarmerCard.tsx` (substituir SVG pela `<img>`)
- **edit** `src/lib/cardBatchExport.ts` (desenhar PNG no jsPDF)
