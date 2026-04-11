

# Correcção: Remover Header/Footer Duplicado do Portal de Verificação

## Problema
A página `/portal/verificar` é renderizada dentro do `PublicLayout` (que já tem header e footer), mas o componente `VerificationPortal.tsx` inclui o seu próprio header (com logo SIGAFLO + "Portal de Verificação Pública") e footer — resultando em duas barras de navegação visíveis.

## Solução
Remover o `<header>` e o `<footer>` do `VerificationPortal.tsx`, mantendo apenas o conteúdo central (hero, tipos de verificação, verificações recentes). O `PublicLayout` já fornece a navegação e o rodapé.

Também actualizar os links internos de `/verificar/...` para `/portal/verificar/...` para consistência com a estrutura de rotas.

## Ficheiro Alterado
- `src/pages/public/VerificationPortal.tsx` — remover linhas do header (62-80) e footer (189-201), manter secções hero + conteúdo

