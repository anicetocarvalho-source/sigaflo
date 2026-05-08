## Diagnóstico

O sidebar actual tem **24 entradas top-level** misturadas (registo, módulos sectoriais, intelligence, admin), o que obriga a scroll longo e dificulta encontrar funcionalidades. A solução é agrupar por **domínio funcional** usando cabeçalhos de secção (mesmo padrão visual já usado em "Portal Público" e "Ferramentas").

## Proposta de Agrupamento

Reorganizar `navigation` em **6 secções** com labels uppercase tipo separador:

```text
PRINCIPAL
  • Painel Principal
  • Notificações
  • Mapas

CADASTRO E TERRITÓRIO
  • Agricultores ▾  (registo, escolas, cooperativas, parcelas, cartões ID, cadastro de campo, acesso externo)
  • Técnicos de Campo
  • Infra-estruturas ▾
  • Histórico de Produção
  • Certificados ▾

SECTORES PRODUTIVOS
  • Gestão Florestal ▾
  • Cadeia do Café ▾
  • Produção de Arroz ▾
  • Mecanização Agrícola

COMÉRCIO E FINANCEIRO
  • Vendas & POS ▾
  • Crédito e Seguro
  • Seguros Agrícolas
  • Gestão de Incentivos ▾

INTELIGÊNCIA E MONITORIA
  • Observatório (ONAF)               [nacional]
  • Identidade Produtiva (IPN)
  • Monitoria ▾  (alertas, score, NDVI)
  • Risco Climático ▾
  • Ocorrências ▾
  • Laboratório de Dados              [nacional]

ADMINISTRAÇÃO
  • Gestão de Utilizadores
  • Companion / NFC ▾
  • Alertas de Elegibilidade

FERRAMENTAS  (já existe)
  • Relatórios · Documentação

PORTAL PÚBLICO  (já existe)
  • Verificação de Documentos
```

### Justificação dos agrupamentos

- **Cadastro e Território**: tudo o que descreve o "quem" e o "onde" (agricultores, parcelas, técnicos, infra, certificados de produto, histórico).
- **Sectores Produtivos**: as 4 cadeias de valor (Florestal, Café, Arroz, Mecanização).
- **Comércio e Financeiro**: fluxo de dinheiro (POS, crédito, seguros, incentivos/subsídios).
- **Inteligência e Monitoria**: dashboards analíticos, scoring, alertas, observatório, lab de dados.
- **Administração**: backoffice (utilizadores, dispositivos Companion, auditoria de elegibilidade).
- **Notificações** e **Mapas** sobem para "Principal" (uso transversal frequente); **Relatórios** e **Documentação** ficam em "Ferramentas".

## Detalhes Técnicos

**Ficheiro único alterado**: `src/components/layout/Sidebar.tsx`

1. Substituir o array `navigation: NavItem[]` por `navigationSections: NavSection[]` com a forma:
   ```ts
   interface NavSection { label: string; items: NavItem[] }
   ```
2. Mover `Notificações` e `Mapas` de `secondaryNavigation` para a secção `Principal`; manter `Relatórios` e `Documentação` em "Ferramentas".
3. Render: para cada secção, renderizar o cabeçalho com a mesma classe já usada (`text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-2`) seguido dos itens. Adicionar `mt-4` entre secções e ocultar a secção inteira se ficar sem itens visíveis após o filtro RBAC.
4. Manter intacta a lógica de `allowedRoles`, `adminOnly`, `expandedItems`, `isActive`/`isChildActive` e o auto-expand baseado na rota actual.
5. Nenhuma rota muda — só reordenação visual e cabeçalhos.

## Fora de Âmbito

- Não mexer em `App.tsx`, rotas, ou nomes de páginas.
- Não introduzir collapse de secções inteiras (manter sempre visíveis para previsibilidade).
- Não alterar `MobileSidebar.tsx` neste passo (pode replicar-se depois com a mesma estrutura).
