

# Plano: Correcção de Validações e Documentação de Testes de Limites

## Resumo
Corrigir os 7 problemas de validação identificados na auditoria anterior (que permanecem no código) e gerar um relatório PDF actualizado documentando todos os testes de limites e casos extremos.

## Parte 1 — Correcções de Código (7 ficheiros)

### 1. OccurrenceForm.tsx (linha 23-25)
Adicionar `.min(0, 'O valor deve ser positivo')` a `affected_area_ha`, `affected_farmers_count` e `estimated_loss_aoa`.

### 2. LicenseForm.tsx (linha 38-42)
- `concession_area_ha`: adicionar `.min(0, 'O valor deve ser positivo')`
- `latitude`: adicionar `.min(-90).max(90)` com mensagem PT
- `longitude`: adicionar `.min(-180).max(180)` com mensagem PT
- `authorized_volume_m3`: adicionar `.min(0)`

### 3. LogForm.tsx (linha 39-40)
- `length_m`: adicionar `.min(0, 'Comprimento deve ser positivo')`
- `diameter_cm`: adicionar `.min(0, 'Diâmetro deve ser positivo')`

### 4. CoffeeProductionForm.tsx (linha 57)
- `altitude_m`: adicionar `.min(0, 'Altitude deve ser positiva').max(5000, 'Altitude máxima: 5000m')`

### 5. ProgramForm.tsx (linha 55)
- `rule_name`: adicionar mensagem PT: `.min(3, 'Nome da regra deve ter pelo menos 3 caracteres')`
- `rule_type`, `operator`, `value`: adicionar mensagens PT

### 6. AuthPage.tsx (linha 26)
- `full_name`: mudar `.min(2)` para `.min(3, 'Nome completo deve ter pelo menos 3 caracteres')` para consistência com o padrão centralizado

### 7. TreeForm.tsx (linhas 40-42)
- `diameter_cm`: adicionar `.min(0, 'Diâmetro deve ser positivo')`
- `height_m`: adicionar `.min(0, 'Altura deve ser positiva')`
- `estimated_volume_m3`: adicionar `.min(0, 'Volume deve ser positivo')`

## Parte 2 — Relatório PDF

Gerar `/mnt/documents/SIGAFLO_Teste_Limites_v2.pdf` com:
- Tabela módulo-a-módulo: campo, regra, caso testado, resultado, severidade
- Secção "Problemas Corrigidos" (os 7 acima)
- Resumo executivo com métricas (total de campos, % com validação, gaps restantes)

## Ficheiros Alterados
1. `src/components/occurrences/OccurrenceForm.tsx`
2. `src/components/forestry/LicenseForm.tsx`
3. `src/components/forestry/LogForm.tsx`
4. `src/components/forestry/TreeForm.tsx`
5. `src/components/coffee/CoffeeProductionForm.tsx`
6. `src/components/incentives/ProgramForm.tsx`
7. `src/pages/auth/AuthPage.tsx`

## Artefacto Gerado
- `/mnt/documents/SIGAFLO_Teste_Limites_v2.pdf`

