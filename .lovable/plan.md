

# Ajuste das Abas e Foto no Perfil do Agricultor

## Problemas Identificados
1. **16 tabs em duas linhas** — transborda visualmente, difícil de navegar (visível no screenshot)
2. **Sem foto do agricultor no header** — o campo `photo_url` existe no modelo mas não é mostrado

## Solução

### 1. Header com Foto (Avatar)
Adicionar um `Avatar` circular (48×48) à esquerda do nome no header (linha ~220-238 de `FarmerProfileComplete.tsx`). Se `farmer.photo_url` existir, mostra a imagem; caso contrário, mostra as iniciais do nome com fundo colorido por tipo.

### 2. Reorganizar Tabs com Scroll Horizontal
Em vez de duas linhas de tabs, usar um container com **scroll horizontal** (`overflow-x-auto`) e uma única linha. As tabs ficam todas visíveis com scroll lateral, sem quebrar em múltiplas linhas.

Alterações:
- `TabsList` recebe `className="flex w-full overflow-x-auto flex-nowrap"` em vez de `flex-wrap`
- Cada `TabsTrigger` com `flex-shrink-0` para manter largura natural
- Opcional: agrupar as tabs em categorias lógicas com separadores visuais subtis (um `|` ou margem extra) entre grupos:
  - **Perfil**: Identificação, Documentos, Cartão, Biometria
  - **Actividade**: Produção, Parcelas, Campanhas, Certificados
  - **Financeiro**: AgroPay, Compras, Incentivos, Scores
  - **Contexto**: Ocorrências, Representantes, Previsão

## Ficheiros a Editar

| Ficheiro | Alteração |
|---|---|
| `src/components/farmers/FarmerProfileComplete.tsx` | Adicionar Avatar no header + tabs em scroll horizontal |

## Detalhes Técnicos
- Usar componente `Avatar` do shadcn/ui (já existe em `src/components/ui/avatar.tsx`)
- `TabsList`: trocar `flex-wrap` por `overflow-x-auto flex-nowrap` com scrollbar subtil via Tailwind
- Foto fallback: iniciais extraídas de `farmer.name.split(' ')` com cor de fundo baseada em `getFarmerTypeColor`

