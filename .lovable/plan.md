## Objetivo

Cooperativas e Escolas de Campo (ECA) estão a herdar funcionalidades pensadas para o agricultor individual (cartão, IPN, AgroPay, POS, certificados de produção, representantes legais). Vamos definir explicitamente o conjunto de tabs por tipo de entidade e bloquear no backend o que não faz sentido.

---

## 1. Reorganizar `profileTabsConfig.tsx` por tipo

Criar mapeamento explícito `tabsByType` em vez de usar `visibleFor` campo a campo. Resultado:

**Agricultor individual / família / empresa** (mantém actual):
Identificação, Agregado (só individual), Documentos, Cartão, Biometria (indiv/família), Parcelas, Campanhas, Produção, Mecanização, AgroPay, Compras, Incentivos, Scores, Certificados, Ocorrências, NDVI, Previsão, Representantes.

**Cooperativa** (novo conjunto):
- Identificação · Detalhes da Cooperativa · Documentos · Membros
- Parcelas (comunitárias) · Campanhas (agregadas) · Produção (agregada) · Mecanização
- Incentivos · Ocorrências · NDVI/Alertas

Removidos: Cartão, Biometria, Agregado, AgroPay, Compras POS, Scores IPN, Certificados de produção, Representantes legais, Previsão individual.

**Escola de Campo (ECA)** — apenas pedagógico:
- Identificação · Detalhes da ECA · Documentos · Membros (alunos) · Ocorrências

Removidos: tudo relacionado a financeiro, produção, parcelas, cartão, biometria.

## 2. Limpar `FarmerProfileComplete.tsx`

- Esconder o bloco "Workflow Actions" e botões "Gerar Certificado" / "Gerar Dossiê Financeiro" quando tipo for ECA.
- Não chamar hooks de IPN/CreditInsurance/AgroPay quando o tipo não os usa (passar `enabled` correctamente para evitar queries desnecessárias).
- Ajustar `QuickStats` para não mostrar credit score / incentivos em ECA.

## 3. Bloquear emissão de cartão e wallet na UI

- `FarmerCard.tsx` / `CardEligibilityPanel`: se `farmer_type IN ('cooperative','field_school')` mostrar estado vazio com explicação ("Cartão SIGAFLO destina-se a produtores individuais e famílias").
- `useGenerateCard` / `useActiveFarmerCard`: rejeitar antes da chamada se tipo inválido.
- `CardsManagementPage` já filtra coop/ECA — adicionar mesma exclusão em `useCardStats`.
- `AgroPay`/Wallet: idem, ocultar criação para ECA. Coop fica fora desta fase (sem AgroPay próprio).

## 4. Bloqueio no backend (migração SQL)

Adicionar triggers `BEFORE INSERT` que rejeitam:

- `farmer_cards` quando o `farmer_id` referenciar tipo `cooperative` ou `field_school`.
- `farmer_wallets` (idem) — ECA bloqueada; coop opcionalmente bloqueada nesta fase.

Função de validação reutilizável `public.assert_farmer_eligible_for_card(_farmer_id uuid)` com `SET search_path = public`. Mensagem em português via `RAISE EXCEPTION`.

Não apagar registos existentes; apenas impedir novos. Marcar cartões existentes de coop/ECA como `revogado` com motivo "tipo de entidade não elegível" via script de dados separado (a confirmar antes de correr).

## 5. Membros: rota e secção

A aba "Membros" em coop/ECA já existe (`members`). Garantir que:
- Em coop: lista cooperados + total/área agregada e link para adicionar.
- Em ECA: lista alunos/produtores em formação, sem botões financeiros.

## 6. Testes

- Snapshot/render test em `FarmerProfileComplete` para cada um dos 5 tipos confirmando o conjunto de tabs visível.
- Teste de migração: insert em `farmer_cards` com farmer cooperativo deve falhar.

## 7. Memória do projeto

Atualizar `mem://features/farmer-id-card-module` e adicionar nova memória `mem://logic/entity-type-feature-matrix` com a matriz de funcionalidades por tipo, para evitar regressões.

---

## Detalhes técnicos

**Migração SQL (resumo):**
```sql
create or replace function public.assert_farmer_eligible_for_card(_farmer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_type farmer_type;
begin
  select farmer_type into v_type from public.farmers where id = _farmer_id;
  if v_type in ('cooperative','field_school') then
    raise exception 'Cooperativas e Escolas de Campo não são elegíveis para cartão SIGAFLO';
  end if;
end$$;

create trigger trg_card_eligibility before insert on public.farmer_cards
for each row execute function public.tg_assert_card_eligibility();
```

**Ficheiros a tocar:**
- `src/components/farmers/profile/profileTabsConfig.tsx` (reescrever)
- `src/components/farmers/FarmerProfileComplete.tsx` (gating + hooks condicionais)
- `src/components/farmers/profile/QuickStats.tsx`
- `src/components/farmers/FarmerCard.tsx`, `CardEligibilityPanel.tsx`, `CardActionsMenu.tsx`
- `src/hooks/useFarmerCards.ts` (guardas client-side)
- nova migração Supabase
- testes em `src/components/farmers/__tests__/`

## Fora do âmbito
- Redesenho visual dos cards de coop/ECA.
- Migração de dados históricos (cartões já emitidos a coop/ECA) — proposto em script separado para aprovação.
