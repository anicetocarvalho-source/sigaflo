# Foto no perfil + Redesign do cartão (PVC CR-80)

## 1. Fotografia no perfil do agricultor

**Problema:** A `photo_url` só pode ser carregada via formulário de edição. No perfil (`FarmerProfileComplete.tsx`) o avatar do cabeçalho usa `farmer.photo_url`, mas se estiver vazia o utilizador não tem como carregar diretamente — e é a mesma foto que alimenta o cartão.

**Solução:**
- No cabeçalho do perfil, tornar o `Avatar` interativo (hover → ícone câmara) abrindo um pequeno diálogo com o componente existente `PhotoUpload`.
- Ao gravar, fazer `update` em `farmers.photo_url` via `useUpdateFarmer` e invalidar a query do farmer para refletir imediatamente no cabeçalho **e** no cartão.
- Mostrar fallback com iniciais quando ausente (já existe via `AvatarFallback`), mas adicionar badge "Adicionar foto" quando vazio e o utilizador tiver permissão de edição.
- Respeitar permissões: só editores (mesmas regras do botão "Editar" já presente) veem o controlo.

## 2. Redesign da frente do cartão (FarmerCard.tsx)

Manter proporção CR-80 (1.585:1), mas elevar o nível visual:

- **Fundo:** gradiente diagonal verde institucional + camada subtil de padrão geométrico (mapa estilizado de Angola ou linhas guilloché em SVG inline) com baixa opacidade — sensação de documento oficial.
- **Banda superior:** brasão/escudo (placeholder SVG ou emoji 🇦🇴 estilizado), "REPÚBLICA DE ANGOLA" em letras finas espaçadas, "Ministério da Agricultura e Florestas" abaixo, e selo "SIGAFLO" como wordmark dentro de pílula com vidro fosco (`backdrop-blur`).
- **Foto:** maior (72×88), borda dourada fina, cantos levemente arredondados, sombra interna.
- **Hierarquia tipográfica:** nome em destaque (uppercase, tracking apertado), BI/NIF em monospace dourado, província/município com ícone pin minúsculo.
- **Chip-stripe simulado:** rectângulo dourado com gradiente metálico no canto (à esquerda do nome) — leitura de "cartão real".
- **Rodapé frontal:** número de registo em monospace + tipo de agricultor como pílula translúcida + indicador de biometria (verificado/pendente).
- **Estados:** quando `status !== approved/issued`, manter overlay mas mais elegante (faixa diagonal "RASCUNHO" em vez de fundo preto).

Cores via tokens semânticos do design system (não hardcoded). Adicionar tokens de "card-gold" e "card-green-deep" em `index.css` se necessário (HSL).

## 3. Impressão no formato PVC padrão (CR-80)

**Problema atual:** `handleDownload` abre janela com `padding: 20px` no body e `box-shadow`, o que não imprime correctamente em impressoras de cartão PVC (Zebra, Evolis, Fargo, etc.) que esperam o cartão a ocupar toda a página de 85.6×54 mm sem margens.

**Solução:**
- Configurar `@page { size: 85.6mm 53.98mm; margin: 0; }` para impressão directa em cartão.
- Oferecer dois modos no diálogo de download:
  1. **Imprimir em cartão PVC** (CR-80, 1 face por página, sem margens, sem sombras).
  2. **Imprimir em A4** (frente + verso lado-a-lado com guias de corte tracejadas, marcas de registo nos cantos, ideal para teste em papel).
- Remover `box-shadow` e bordas arredondadas no `@media print` (impressoras PVC fazem o corte/canto físico).
- Adicionar `-webkit-print-color-adjust: exact; print-color-adjust: exact;` para preservar cores.
- Garantir que a frente e o verso ficam em páginas separadas (`page-break-after: always`) no modo PVC, para impressão duplex automática.
- Embutir a foto como `<img>` com `crossOrigin` e o QR como SVG inline (em vez de depender de api.qrserver.com, que pode falhar offline) — usar `qrcode` para gerar dataURL.

## Detalhes técnicos

- Ficheiros editados: `src/components/farmers/FarmerCard.tsx`, `src/components/farmers/FarmerProfileComplete.tsx`, possivelmente `src/index.css` (tokens dourado/verde profundo).
- Sem migrações de DB (campo `photo_url` já existe).
- Sem alterações de regras de negócio nem de RLS.
- Reutilizar `PhotoUpload` existente, `useUpdateFarmer` existente, `qrcode.react` (frente do cartão pode incluir um micro-QR opcional além do verso).

## Perguntas em aberto

Nenhuma — a frente do cartão actual é genérica e o pedido de "design mais apelativo + impressão PVC padrão" é claro. Avanço com a interpretação institucional acima salvo indicação em contrário.
