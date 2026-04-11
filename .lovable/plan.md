

# Plano: Correcção de Problemas de Navegação e Rotas

## Problemas Encontrados

### 1. Página 404 em inglês (Severidade: Média)
A página `NotFound.tsx` mostra "Oops! Page not found" e "Return to Home" em vez de português.

### 2. Sub-rotas inexistentes do portal sem contexto (Severidade: Média)
Ao aceder `/portal/pagina-inexistente`, o utilizador vê o 404 genérico sem a navegação do portal. Deveria mostrar um 404 dentro do `PublicLayout`.

### 3. Rota legada `/verificar` sem navegação do portal (Severidade: Baixa)
A rota `/verificar` renderiza `VerificationPortal` diretamente, sem o header do portal público (Início, Sectores, etc.).

### 4. Papéis do utilizador demo não carregados (Severidade: Alta)
O utilizador `admin.nacional@demo.sigaflo.ao` autentica-se com sucesso mas é redirecionado para "Acesso Negado" em todas as rotas protegidas — a tabela `user_roles` não contém os papéis correspondentes. Isto é um problema de dados/seeding, não de código de rotas.

## Correcções Propostas

### Ficheiro 1: `src/pages/NotFound.tsx`
- Traduzir textos para português: "Página não encontrada", "Voltar ao Início"

### Ficheiro 2: `src/App.tsx`
- Adicionar rota catch-all `*` dentro do bloco `<Route path="/portal">` para mostrar 404 dentro do `PublicLayout`
- Alterar rotas legadas `/verificar` e `/verificar/*` para redirecionar para `/portal/verificar` com `<Navigate>`

### Ficheiro 3: Novo componente `src/pages/public/PortalNotFound.tsx`
- Página 404 estilizada dentro do portal, com navegação intacta e link para `/portal`

### Ficheiro 4: Verificação de seeding de papéis
- Verificar a edge function `seed-demo-users` para garantir que insere os papéis na tabela `user_roles`

## Ficheiros a Alterar
1. `src/pages/NotFound.tsx` — tradução PT
2. `src/App.tsx` — portal catch-all + redirect legado
3. `src/pages/public/PortalNotFound.tsx` — novo componente
4. `supabase/functions/seed-demo-users/index.ts` — verificar seeding de roles

