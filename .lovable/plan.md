

# Plano: Documento DOCX — Descrição Completa da Plataforma SIGAFLO

## Objectivo
Gerar um documento Word (.docx) profissional com a descrição completa da plataforma SIGAFLO, estruturado para inclusão directa numa proposta técnica e comercial.

## Estrutura do Documento

1. **Capa** — Logo placeholder, título "SIGAFLO — Sistema Integrado de Gestão Agropecuária e Florestal", subtítulo "Proposta Técnica e Comercial", data
2. **Sumário Executivo** — Visão geral da plataforma, contexto angolano, objectivos estratégicos
3. **Arquitectura e Stack Tecnológico** — React 18, Vite, Supabase, Edge Functions, Leaflet, Recharts, IA integrada
4. **Módulos Funcionais** (tabela detalhada para cada um dos 22+ módulos):
   - Painel Principal (Dashboard)
   - Registo Nacional de Agricultores (6 sub-módulos)
   - Histórico de Produção
   - Certificados Agrícolas
   - Ocorrências Climáticas e Fitossanitárias
   - Infra-estruturas (Agropecuárias + Mercados)
   - Gestão Florestal (6 sub-módulos)
   - Cadeia do Café (4 sub-módulos)
   - Produção de Arroz (6 sub-módulos)
   - Observatório Nacional (ONAF)
   - Identidade Produtiva Nacional (IPN)
   - Gestão de Incentivos + Analytics
   - Risco Climático + Analytics
   - Crédito e Seguro Agrícola
   - Mecanização Agrícola
   - Técnicos de Campo
   - Vendas & POS (4 sub-módulos)
   - Seguros Agrícolas
   - Monitoria (Alertas, Score, NDVI)
   - Laboratório de Dados
   - Gestão de Utilizadores
5. **Portal Público** — 14 páginas públicas, verificação QR, transparência
6. **Segurança e Controlo de Acessos** — 8 perfis, RLS, workflow hierárquico, auditoria
7. **Integrações Externas** — Mapbox, NASA MODIS, IA (Gemini/GPT), SMS
8. **Indicadores de Escala** — Tabela com métricas (55 rotas, 60+ tabelas, 10 Edge Functions, etc.)

## Implementação Técnica

- Gerar o DOCX com `docx-js` (Node.js) usando formatação profissional
- Cores institucionais verdes (sector agropecuário angolano)
- Tabelas formatadas com bordas e sombreamento para cabeçalhos
- Cabeçalho e rodapé com paginação
- Saída em `/mnt/documents/SIGAFLO_Proposta_Tecnica.docx`
- QA visual: converter a PDF e depois a imagens para verificar todas as páginas

## Ficheiros Envolvidos
- Nenhum ficheiro do projecto será alterado
- Apenas será criado um script temporário em `/tmp/` e o artefacto final em `/mnt/documents/`

