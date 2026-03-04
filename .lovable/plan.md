

# SIGAFLO — Documento Descritivo da Plataforma

## 1. Visão Geral

**SIGAFLO** (Sistema Integrado de Gestão Agropecuária e Florestal) é uma plataforma web institucional desenvolvida para o contexto de Angola, destinada à gestão integrada dos sectores agropecuário e florestal. A plataforma serve múltiplas instituições governamentais (MINAGRIP, INCA, IDF, INE, INAMET) e opera sobre a hierarquia administrativa nacional (províncias → municípios → comunas).

**Stack tecnológico:** React 18, TypeScript, Vite, Tailwind CSS, Lovable Cloud (Supabase), Mapbox GL.

---

## 2. Arquitectura de Segurança e Controlo de Acesso

### 2.1 Papéis (RBAC Jurisdicional)
O sistema implementa controlo de acesso baseado em papéis com restrição territorial:

| Papel | Âmbito |
|---|---|
| `admin_national` | Acesso total ao território |
| `admin_provincial` | Restrito à sua província |
| `admin_municipal` | Restrito ao seu município |
| `technician_national` | Técnico com visão nacional |
| `technician_provincial` | Técnico provincial |
| `technician_municipal` | Técnico municipal |
| `private_entity` | Entidades privadas (exportadores, etc.) |
| `viewer` | Apenas leitura |

### 2.2 Segurança da Base de Dados
- **Row Level Security (RLS)** activa em todas as tabelas sensíveis
- Funções auxiliares SQL: `has_role()`, `is_admin()`, `is_national_level()`, `can_access_province()`, `can_access_municipality()`
- Views com `security_invoker = on` para dados públicos (`profiles_safe`, `coffee_verification_public`, `license_verification_public`)
- Edge functions protegidas por JWT e verificação de papel

### 2.3 Autenticação
- Registo de utilizadores controlado administrativamente (sem signup anónimo)
- Confirmação de e-mail obrigatória
- Sessões geridas pelo sistema de autenticação integrado

---

## 3. Módulos Principais

### 3.1 Gestão de Agricultores (`/agricultores`)
- **Registo** de agricultores com tipos: Individual, Familiar, Cooperativa, Escola de Campo, Empresa
- **Perfil completo** com documento, telefone, coordenadas GPS, área total
- **Workflow de aprovação**: Rascunho → Submetido → Validado → Aprovado
- **Upload de documentos** e fotografias
- **Captura biométrica** (impressão digital)
- **Cooperativas e Escolas de Campo** com gestão de membros
- Geração automática de número de registo (ex: AGR-000001, COOP-000001)

### 3.2 Histórico de Produção (`/producao`)
- Registo de produção agrícola por campanha (época principal/secundária)
- Associação a agricultor, cultura, área cultivada, produção obtida
- Cálculo de produtividade (t/ha)
- CRUD completo com workflow de validação

### 3.3 Certificados Agrícolas (`/certificados`)
- Tipos: Produtor, Origem, Orgânico, Qualidade
- **Workflow completo** de emissão com aprovações em cadeia
- Geração de **QR Code** para verificação pública
- Geração automática de número (CERT-2025-000001)
- **Verificação pública** sem autenticação via portal `/verificar/certificado`

### 3.4 Ocorrências Climáticas e Fitossanitárias (`/ocorrencias`)
- **Climáticas**: Seca, Inundação, Geada, Tempestade, Onda de Calor, Incêndio, Granizo
- **Fitossanitárias**: Pragas, Doenças
- Classificação por severidade: Baixa, Média, Alta, Crítica
- Workflow: Reportado → Em Investigação → Confirmado → Resolvido
- Geolocalização com mapa
- **Recomendações por IA** integradas via edge function
- Sistema de **alertas SMS** (simulador)
- Cálculo automático de métricas de risco provincial

### 3.5 Infra-estruturas (`/infraestruturas`)
- **Agropecuárias**: Silos, armazéns, centros de processamento
- **Mercados**: Mercados agrícolas com localização e capacidade
- Registo de estado de conservação e capacidade

---

## 4. Módulos Sectoriais

### 4.1 Gestão Florestal (`/florestal`)

#### 4.1.1 Inventário Florestal
- Registo de concessões florestais
- Cadastro de árvores com código único (`tree_code`)
- Espécie, diâmetro, altura, coordenadas GPS

#### 4.1.2 Licenciamento
- Tipos: Exploração, Transporte, Exportação, Serraria, Processamento
- Geração automática de número (LEX-2025-000001)
- Workflow de aprovação institucional
- **Verificação pública** via `/verificar/licenca`

#### 4.1.3 Rastreabilidade
- Registo de toros com código único (`log_code`)
- Timeline de cadeia de custódia (árvore → toro → transporte → destino)
- Guias de transporte com validade (`valid_until`)
- Mapa de rastreio e alertas
- Leitura de **QR Code** para verificação

#### 4.1.4 Fiscalização e Enforcement
- Registo de infracções florestais (INF-2025-000001)
- KPIs de fiscalização
- Mapa de actividade de enforcement
- Alertas de compliance

#### 4.1.5 Reflorestamento
- Gestão de projectos de reflorestamento
- Monitorização: área plantada, árvores plantadas, taxa de sobrevivência
- Gestão de viveiros florestais
- Charts de progresso e analytics

#### 4.1.6 Denúncias
- Submissão de denúncias (anónimas ou identificadas)
- Workflow: Recebida → Em Análise → Investigação → Verificada → Resolvida
- Analytics por tipo e região

### 4.2 Cadeia do Café (`/cafe`)

#### 4.2.1 Gestão de Lotes
- Registo por lote com variedade, peso, método de processamento
- Classificação de qualidade

#### 4.2.2 Semaforização
- Sistema **Verde/Amarelo/Vermelho** para controlo de qualidade
- KPIs e charts de distribuição

#### 4.2.3 Rastreio por Lote
- Timeline completa do lote: produção → processamento → exportação
- Código de rastreio único

#### 4.2.4 Verificação Pública
- Portal `/verificar/cafe` para consulta pública de lotes
- Consulta à base de dados em tempo real

### 4.3 Módulo Estratégico do Arroz (`/arroz`)
- **Produção Nacional**: Dados por província, município, campanha, variedade
- **Importações**: Volume, país de origem, preço CIF/FOB, importador
- **Preços**: Retalho e grossista por província
- **Consumo**: Per capita e total por província
- **Políticas**: Análise de políticas públicas para soberania alimentar
- **Simulador**: Projecções de cenários de produção vs. importação

---

## 5. Módulos de Análise e Inteligência

### 5.1 ONAF — Observatório Nacional de Alerta Fitossanitário (`/onaf`)
- Mapa nacional com camadas de risco
- Dashboard executivo com KPIs consolidados
- Comparação entre províncias
- Timeline preditiva
- Simulador de cenários
- Exportação de relatórios
- Alertas automáticos

### 5.2 IPN — Identidade Produtiva Nacional (`/ipn`)
- Perfil produtivo do agricultor (histórico, culturas, produtividade)
- **Score de reputação** baseado em dados reais
- Comparação entre produtores
- Timeline de produção
- KPIs individuais e agregados

### 5.3 Risco Climático (`/risco-climatico` e `/risco-climatico-analytics`)
- Historial de eventos climáticos
- Correlação clima-produção
- Mapa de risco com camadas
- **Simulador de perdas**
- Gestão de evidências para seguros
- Relatórios de risco
- Alertas inteligentes
- Simulações de cenários (RCP 4.5, 8.5)

### 5.4 Gestão de Incentivos (`/incentivos` e `/incentivos-analytics`)
- Configuração de programas de apoio e subsídios
- Gestão de alocações a agricultores
- **Simulador de impacto**
- Monitorização pós-alocação
- Rankings de programas
- Mapa de distribuição de subsídios
- Alertas de elegibilidade

### 5.5 Crédito e Seguro Agrícola (`/credito-seguro`)
- **Perfis financeiros** dos agricultores
- Simulador de crédito
- Scores de risco de seguro
- Dossiers de crédito
- Certificados de produção (como garantia)
- Dashboard institucional para entidades financeiras
- Garantias alternativas

### 5.6 Laboratório de Dados (`/laboratorio-dados`)
- **Acesso restrito** a administradores e técnicos nacionais
- Catálogo de datasets agro-florestais
- Gestão de organizações e investigadores
- Pedidos de acesso com workflow de aprovação
- Sandbox de consultas
- Séries temporais e comparações regionais
- Auditoria de exportações
- Alertas inteligentes

---

## 6. Funcionalidades Transversais

### 6.1 Portal Público de Verificação (`/verificar`)
- Acesso **sem autenticação**
- Verificação de certificados, licenças florestais e lotes de café
- Leitura de QR Code via câmara do dispositivo
- Consulta por código manual

### 6.2 Relatórios (`/relatorios`)
- Geração de relatórios consolidados
- Exportação em PDF e Excel (jsPDF, xlsx)

### 6.3 Mapas (`/mapas`)
- Visualização geográfica integrada com Mapbox GL
- Camadas por módulo (agricultores, ocorrências, florestas, etc.)

### 6.4 Notificações (`/notificacoes`)
- Sistema de notificações com persistência em base de dados
- Sino de notificações no cabeçalho

### 6.5 Chatbot Assistente
- Assistente IA integrado (edge function `sigaflo-chat`)
- Suporte contextual em português

### 6.6 Documentação (`/documentacao`)
- Guias técnicos por sector
- Vídeo-tutoriais, FAQs e manuais

### 6.7 Configurações (`/configuracoes`)
- Preferências do utilizador
- Gestão de perfil

### 6.8 Gestão de Utilizadores (`/utilizadores`)
- Criação e edição de utilizadores (admin only)
- Atribuição de papéis e jurisdições
- Edge functions: `create-user`, `update-user`

---

## 7. Funcionalidades Técnicas

| Funcionalidade | Estado |
|---|---|
| Autenticação e RBAC jurisdicional | ✅ Implementado |
| RLS em todas as tabelas sensíveis | ✅ Implementado |
| Paginação server-side | ✅ Implementado |
| Skeleton loaders (loading states) | ✅ Implementado |
| Mensagens de erro em português | ✅ Implementado |
| Mobile responsive (drawer sidebar) | ✅ Implementado |
| Edge functions protegidas por JWT | ✅ Implementado |
| Views públicas com security_invoker | ✅ Implementado |
| Exportação PDF/Excel | ✅ Implementado |
| QR Code (geração e leitura) | ✅ Implementado |
| Integração Mapbox | ✅ Implementado |
| IA generativa (chat + recomendações) | ✅ Implementado |

---

## 8. Base de Dados

### Tabelas Principais
Agricultores, certificados, produção, ocorrências climáticas, infra-estruturas, licenças florestais, árvores, toros, guias de transporte, infracções, denúncias, lotes de café, produção de arroz, importações, preços, consumo, incentivos, perfis financeiros, datasets, notificações, perfis de utilizador, papéis, auditoria.

### Funções e Triggers
- Geração automática de números sequenciais (agricultores, certificados, licenças, infracções, denúncias)
- Cálculo automático de métricas de risco provincial
- Actualização automática de timestamps
- Criação automática de perfil no registo de utilizador

---

## 9. Edge Functions (Backend)

| Função | Descrição |
|---|---|
| `create-user` | Criação administrativa de utilizadores |
| `update-user` | Actualização de dados de utilizador |
| `seed-demo-data` | Dados de demonstração (admin only) |
| `seed-demo-users` | Utilizadores de demonstração (admin only) |
| `sigaflo-chat` | Chatbot assistente com IA |
| `occurrence-ai` | Análise IA de ocorrências |
| `occurrence-ai-recommendations` | Recomendações IA para ocorrências |
| `report-occurrence-ai` | Relatório IA de ocorrências |
| `get-mapbox-token` | Token de acesso ao Mapbox |

---

*Documento gerado em 03/03/2026 — SIGAFLO v1.0*

