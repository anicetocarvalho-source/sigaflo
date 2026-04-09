

# Substituir ONAPA por SIGAFLO

## Alteração
Substituir todas as 5 ocorrências de "ONAPA" por "SIGAFLO" no ficheiro `src/components/farmers/FarmerCard.tsx`:

1. **Linha 38** — `plataforma: 'ONAPA'` → `plataforma: 'SIGAFLO'` (payload QR JSON)
2. **Linha 71** — classe CSS `.onapa` → `.sigaflo` (estilo)
3. **Linha 93** — texto `ONAPA` → `SIGAFLO` (HTML do cartão para impressão)
4. **Linha 127** — rodapé do verso `· ONAPA` → `· SIGAFLO`
5. **Linha 163** — componente React `ONAPA` → `SIGAFLO`
6. **Linha 252** — rodapé React `· ONAPA ·` → `· SIGAFLO ·`

## Ficheiro a editar
| Ficheiro | Alteração |
|---|---|
| `src/components/farmers/FarmerCard.tsx` | 6 substituições de texto |

