

# Correcção: Separação de tipos de agricultor na listagem

## Problema Identificado

A listagem em `/agricultores` mostra **todos os registos** sem distinção de tipo (individuais, famílias, cooperativas, escolas de campo, empresas). Quando o utilizador clica num registo que é na verdade uma Escola de Campo, abre o perfil dessa escola — não de um agricultor individual. A tabela não mostra a coluna "Tipo", tornando impossível distinguir os registos.

As cooperativas e escolas de campo já têm páginas dedicadas (`/agricultores/escolas` e `/agricultores/cooperativas`), mas continuam a aparecer na lista geral.

## Correcções

### 1. Filtrar tipos na listagem principal (`FarmersListComplete.tsx`)
- Filtrar `useFarmers()` para excluir `cooperative` e `field_school` da lista principal (estes têm páginas próprias)
- Adicionar coluna "Tipo" à tabela com o badge colorido (`FarmerTypeIcon` + `getFarmerTypeLabel`)
- Adicionar filtro dropdown por tipo (Individual, Familiar, Empresa)

### 2. Adicionar filtro de tipo no hook (`useFarmers`)
- Suportar filtro `excludeTypes` para excluir tipos específicos da query, OU
- Passar `type` filter com array de tipos permitidos

### 3. Manter consistência nas páginas dedicadas
- `/agricultores/escolas` já filtra por `field_school` — verificar que está correcto
- `/agricultores/cooperativas` já filtra por `cooperative` — verificar

## Ficheiros a editar

| Ficheiro | Alteração |
|---|---|
| `src/components/farmers/FarmersListComplete.tsx` | Filtrar cooperativas/escolas, adicionar coluna Tipo, dropdown filtro |
| `src/hooks/useFarmers.ts` | Adicionar suporte para `excludeTypes` no filtro |

## Resultado esperado
- Lista `/agricultores` mostra apenas: individuais, famílias e empresas
- Coluna "Tipo" visível com badge colorido
- Cooperativas e Escolas de Campo acessíveis apenas pelas suas páginas dedicadas
- Clicar num agricultor abre sempre o perfil correcto do tipo esperado

