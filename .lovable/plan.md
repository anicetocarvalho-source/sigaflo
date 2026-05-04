## Plano

1. **Tornar o workflow sensível ao tipo de entidade**
   - Alterar `WorkflowActions` para receber `farmerType`.
   - Para `cooperative` e `field_school`, trocar a transição final de `Aprovado → Emitido` de **“Emitir Cartão”** para uma ação neutra como **“Activar Registo”**.
   - Ajustar a descrição do diálogo e o toast para não mencionar cartão nesses tipos.

2. **Bloquear ações de emissão para tipos não elegíveis no perfil**
   - Passar `farmer.farmer_type` desde `FarmerProfileComplete` para `WorkflowActions`.
   - Garantir que cooperativas/ECA não veem botões ou textos de emissão de cartão no fluxo de aprovação.
   - Manter agricultores individuais/famílias com o texto atual de cartão.

3. **Atualizar textos legados que induzem emissão automática**
   - Rever os textos em `FarmerForm` e áreas de detalhe que ainda dizem “cartão será gerado automaticamente após validação”.
   - Tornar esses textos condicionais: cartão apenas para tipos elegíveis; cooperativas/ECA apenas “registo activo/emitido”.

4. **Validação rápida**
   - Confirmar por pesquisa que “Emitir Cartão” e mensagens de emissão automática já não aparecem nos fluxos de ECA/cooperativa.
   - Manter intacto o bloqueio backend existente nos triggers de `farmer_cards` e `farmer_wallets`.