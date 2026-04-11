

# Plano: PPTX com Capturas das Principais Telas do SIGAFLO

## Objectivo
Gerar uma apresentação PowerPoint com capturas de ecrã das principais telas do sistema, uma por slide, com título e descrição em cada slide.

## Telas a Capturar (~15 slides)

1. **Login** — `/auth`
2. **Dashboard Principal** — `/` (Index)
3. **Lista de Agricultores** — `/farmers/list`
4. **Registo de Agricultor** — `/farmers/new`
5. **Histórico de Produção** — `/production`
6. **Certificados** — `/certificates`
7. **Gestão Florestal** — `/forestry`
8. **Cadeia do Café** — `/coffee`
9. **Produção de Arroz** — `/rice`
10. **Ocorrências Climáticas** — `/occurrences`
11. **Observatório ONAF** — `/onaf`
12. **Identidade Produtiva (IPN)** — `/ipn`
13. **Incentivos** — `/incentives`
14. **Risco Climático** — `/climate-risk`
15. **Portal Público** — `/portal`

## Abordagem

1. Navegar a cada rota no browser, aguardar carregamento e tirar screenshot
2. Gerar o PPTX com `pptxgenjs`:
   - Slide de capa com título "SIGAFLO — Principais Telas do Sistema" e data
   - Um slide por captura: imagem a ocupar ~90% do slide, título do módulo no topo
   - Paleta verde institucional (Forest & Moss)
3. QA visual: converter a PDF → imagens, inspeccionar

## Resultado
`/mnt/documents/SIGAFLO_Telas_Principais.pptx`

