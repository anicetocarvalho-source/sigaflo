import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Search,
  Book,
  HelpCircle,
  Video,
  Download,
  ExternalLink,
  Users,
  Leaf,
  FileCheck,
  CloudRain,
  TreePine,
  Coffee,
  Wheat,
  Gift,
  Umbrella,
  Landmark,
  FlaskConical,
  Play,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Shield,
  Settings,
  BarChart3,
  Map,
} from 'lucide-react';

// Documentation sections
const documentationSections = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    articles: [
      { id: 'intro', title: 'Introdução ao SIGAFLO', description: 'Visão geral do sistema e suas funcionalidades', readTime: '5 min' },
      { id: 'login', title: 'Como fazer Login', description: 'Acesso ao sistema e recuperação de senha', readTime: '2 min' },
      { id: 'navigation', title: 'Navegação no Sistema', description: 'Entendendo o menu e as páginas principais', readTime: '3 min' },
      { id: 'profile', title: 'Configurar Perfil', description: 'Personalize suas informações de utilizador', readTime: '2 min' },
    ],
  },
  {
    id: 'farmers',
    title: 'Módulo de Agricultores',
    icon: Users,
    color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    articles: [
      { id: 'register-farmer', title: 'Registar Agricultor', description: 'Passo a passo para registo de agricultores', readTime: '8 min' },
      { id: 'farmer-types', title: 'Tipos de Agricultores', description: 'Individual, familiar, cooperativa e escola de campo', readTime: '4 min' },
      { id: 'cooperatives', title: 'Gestão de Cooperativas', description: 'Criar e gerir cooperativas e seus membros', readTime: '6 min' },
      { id: 'field-schools', title: 'Escolas de Campo', description: 'Gerir ECAs e seus participantes', readTime: '5 min' },
      { id: 'farmer-documents', title: 'Documentos do Agricultor', description: 'Upload de fotos, BI e outros documentos', readTime: '4 min' },
    ],
  },
  {
    id: 'production',
    title: 'Histórico de Produção',
    icon: Leaf,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    articles: [
      { id: 'add-production', title: 'Registar Produção', description: 'Como adicionar registos de produção agrícola', readTime: '5 min' },
      { id: 'production-history', title: 'Consultar Histórico', description: 'Visualizar e filtrar histórico de produção', readTime: '3 min' },
      { id: 'yield-analysis', title: 'Análise de Rendimento', description: 'Entender métricas de produtividade', readTime: '4 min' },
    ],
  },
  {
    id: 'certificates',
    title: 'Certificados',
    icon: FileCheck,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    articles: [
      { id: 'issue-certificate', title: 'Emitir Certificado', description: 'Processo de emissão de certificados agrícolas', readTime: '6 min' },
      { id: 'certificate-types', title: 'Tipos de Certificados', description: 'Produtor, produção, origem e fitossanitário', readTime: '4 min' },
      { id: 'verify-certificate', title: 'Verificar Certificado', description: 'Validação via QR Code ou número', readTime: '2 min' },
      { id: 'workflow', title: 'Fluxo de Aprovação', description: 'Etapas de submissão à emissão', readTime: '5 min' },
    ],
  },
  {
    id: 'occurrences',
    title: 'Ocorrências Climáticas',
    icon: CloudRain,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    articles: [
      { id: 'report-occurrence', title: 'Reportar Ocorrência', description: 'Como registar eventos climáticos', readTime: '5 min' },
      { id: 'occurrence-types', title: 'Tipos de Ocorrências', description: 'Seca, inundação, pragas e doenças', readTime: '4 min' },
      { id: 'alerts-system', title: 'Sistema de Alertas', description: 'Receber e gerir notificações', readTime: '3 min' },
    ],
  },
  {
    id: 'forestry',
    title: 'Gestão Florestal',
    icon: TreePine,
    color: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
    articles: [
      { id: 'licenses', title: 'Licenciamento Florestal', description: 'Solicitar e gerir licenças', readTime: '7 min' },
      { id: 'traceability', title: 'Rastreabilidade', description: 'Acompanhar madeira da origem ao destino', readTime: '5 min' },
      { id: 'transport-permits', title: 'Guias de Transporte', description: 'Emitir guias de transporte florestal', readTime: '4 min' },
      { id: 'reforestation', title: 'Reflorestamento', description: 'Gerir projectos de reflorestamento', readTime: '6 min' },
    ],
  },
  {
    id: 'coffee',
    title: 'Cadeia do Café',
    icon: Coffee,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    articles: [
      { id: 'coffee-lots', title: 'Gestão de Lotes', description: 'Registar e acompanhar lotes de café', readTime: '6 min' },
      { id: 'coffee-export', title: 'Exportação', description: 'Processo de exportação de café', readTime: '5 min' },
      { id: 'coffee-quality', title: 'Semaforização', description: 'Sistema de qualidade do café', readTime: '4 min' },
    ],
  },
  {
    id: 'incentives',
    title: 'Gestão de Incentivos',
    icon: Gift,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    articles: [
      { id: 'programs', title: 'Programas de Incentivos', description: 'Criar e gerir programas', readTime: '6 min' },
      { id: 'allocations', title: 'Alocação de Benefícios', description: 'Distribuir incentivos aos agricultores', readTime: '5 min' },
      { id: 'impact', title: 'Análise de Impacto', description: 'Medir resultados dos programas', readTime: '4 min' },
    ],
  },
  {
    id: 'credit',
    title: 'Crédito e Seguro',
    icon: Landmark,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    articles: [
      { id: 'financial-profile', title: 'Perfil Financeiro', description: 'Entender o score de crédito', readTime: '5 min' },
      { id: 'credit-simulation', title: 'Simulação de Crédito', description: 'Calcular capacidade de endividamento', readTime: '4 min' },
      { id: 'insurance-score', title: 'Score de Seguro', description: 'Avaliação de risco para seguros', readTime: '4 min' },
      { id: 'dossier', title: 'Dossiê de Crédito', description: 'Gerar documentação para instituições', readTime: '6 min' },
    ],
  },
];

// FAQs
const faqs = [
  {
    question: 'Como recuperar minha senha?',
    answer: 'Na página de login, clique em "Esqueceu a senha?" e siga as instruções enviadas ao seu email cadastrado.',
  },
  {
    question: 'Posso registar um agricultor sem todos os documentos?',
    answer: 'Sim, é possível criar um registo parcial em estado "Rascunho". Os documentos podem ser adicionados posteriormente antes de submeter para aprovação.',
  },
  {
    question: 'Como adicionar membros a uma cooperativa?',
    answer: 'Aceda ao perfil da cooperativa, vá ao separador "Membros" e clique em "Adicionar Membro". Pode selecionar agricultores já registados no sistema.',
  },
  {
    question: 'Qual a diferença entre os tipos de certificados?',
    answer: 'Certificado de Produtor identifica o agricultor; Certificado de Produção atesta a quantidade produzida; Certificado de Origem comprova a localização; Certificado Fitossanitário atesta a sanidade da produção.',
  },
  {
    question: 'Como verificar um certificado?',
    answer: 'Use o Portal de Verificação Pública (/verificar) para escanear o QR Code ou inserir o número do certificado manualmente.',
  },
  {
    question: 'Quem pode aprovar certificados?',
    answer: 'Certificados passam por um fluxo de aprovação: Técnico Municipal valida, Técnico Provincial aprova, e o sistema emite automaticamente após aprovação.',
  },
  {
    question: 'Como reportar uma ocorrência climática?',
    answer: 'Aceda ao módulo de Ocorrências, clique em "Nova Ocorrência", selecione o tipo (seca, inundação, etc.), a localização e descreva o evento.',
  },
  {
    question: 'O que é o Score de Crédito?',
    answer: 'É uma pontuação calculada com base no histórico de produção, estabilidade, área cultivada e outros factores que indica a capacidade de crédito do agricultor.',
  },
  {
    question: 'Como exportar dados para Excel?',
    answer: 'Na maioria das tabelas do sistema há um botão "Exportar" que gera um ficheiro Excel com os dados filtrados.',
  },
  {
    question: 'O sistema funciona offline?',
    answer: 'Actualmente o SIGAFLO requer conexão à internet. Funcionalidades offline estão em desenvolvimento para versões futuras.',
  },
];

// Video tutorials
const videoTutorials = [
  { id: 'v1', title: 'Introdução ao SIGAFLO', duration: '5:30', category: 'Básico' },
  { id: 'v2', title: 'Registo de Agricultores', duration: '8:45', category: 'Agricultores' },
  { id: 'v3', title: 'Emissão de Certificados', duration: '7:20', category: 'Certificados' },
  { id: 'v4', title: 'Gestão de Cooperativas', duration: '6:15', category: 'Agricultores' },
  { id: 'v5', title: 'Reportar Ocorrências', duration: '4:50', category: 'Ocorrências' },
  { id: 'v6', title: 'Usando o Portal de Verificação', duration: '3:30', category: 'Certificados' },
];

// Downloadable resources
const downloadableResources = [
  { id: 'd1', title: 'Manual do Utilizador SIGAFLO', format: 'PDF', size: '2.4 MB', icon: Book },
  { id: 'd2', title: 'Guia de Registo de Agricultores', format: 'PDF', size: '1.1 MB', icon: Users },
  { id: 'd3', title: 'Fluxograma de Certificados', format: 'PDF', size: '850 KB', icon: FileCheck },
  { id: 'd4', title: 'Template de Importação de Dados', format: 'XLSX', size: '45 KB', icon: FileText },
  { id: 'd5', title: 'Política de Privacidade', format: 'PDF', size: '320 KB', icon: Shield },
  { id: 'd6', title: 'Termos de Uso', format: 'PDF', size: '280 KB', icon: FileText },
];

const DocumentationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Filter sections and articles based on search
  const filteredSections = documentationSections.filter(section => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      section.title.toLowerCase().includes(term) ||
      section.articles.some(a => 
        a.title.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
      )
    );
  });

  const filteredFaqs = faqs.filter(faq => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term);
  });

  return (
    <MainLayout 
      title="Documentação" 
      subtitle="Guias, tutoriais e recursos de ajuda"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar na documentação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Primeiros Passos</h3>
                <p className="text-sm text-muted-foreground">Comece aqui</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Vídeo Tutoriais</h3>
                <p className="text-sm text-muted-foreground">{videoTutorials.length} vídeos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900 group-hover:scale-110 transition-transform">
                <HelpCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">FAQs</h3>
                <p className="text-sm text-muted-foreground">{faqs.length} perguntas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Suporte</h3>
                <p className="text-sm text-muted-foreground">Contacte-nos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="guides" className="space-y-4">
          <TabsList>
            <TabsTrigger value="guides" className="gap-2">
              <Book className="h-4 w-4" />
              Guias
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <Download className="h-4 w-4" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Suporte
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map((section) => (
                <Card key={section.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.color}`}>
                        <section.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription>{section.articles.length} artigos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.articles
                        .filter(a => !searchTerm || 
                          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice(0, 3)
                        .map((article) => (
                          <div
                            key={article.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                          >
                            <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {article.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {article.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {article.readTime}
                            </Badge>
                          </div>
                        ))}
                      {section.articles.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                          Ver todos os {section.articles.length} artigos
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vídeo Tutoriais</CardTitle>
                <CardDescription>Aprenda visualmente com os nossos tutoriais em vídeo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {videoTutorials.map((video) => (
                    <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 text-primary-foreground ml-1" />
                        </div>
                        <Badge className="absolute top-2 right-2">{video.category}</Badge>
                        <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>Respostas às dúvidas mais comuns</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recursos para Download</CardTitle>
                <CardDescription>Manuais, guias e templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {downloadableResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <resource.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {resource.format} • {resource.size}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Contacte-nos
                  </CardTitle>
                  <CardDescription>Precisa de ajuda? Estamos aqui para si</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">suporte@sigaflo.gov.ao</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">+244 222 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Horário de Atendimento</p>
                      <p className="text-sm text-muted-foreground">Segunda a Sexta, 8h - 17h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Dicas Rápidas
                  </CardTitle>
                  <CardDescription>Sugestões para melhor utilização do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Use filtros para encontrar registos mais rapidamente</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Verifique certificados pelo QR Code para autenticidade</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                      <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Mantenha dados de produção actualizados para melhor score de crédito</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <p className="text-sm">Exporte relatórios regularmente para análise offline</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary">2.0.0</p>
                    <p className="text-sm text-muted-foreground">Versão</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-green-600">Online</p>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">2025</p>
                    <p className="text-sm text-muted-foreground">Ano</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">MINAGRIP</p>
                    <p className="text-sm text-muted-foreground">Entidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DocumentationPage;
