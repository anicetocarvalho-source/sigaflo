import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, MessageSquare, Bell, ClipboardList, BarChart3 } from 'lucide-react';
import { OccurrenceForm } from '@/components/occurrences/OccurrenceForm';
import { OccurrencesList } from '@/components/occurrences/OccurrencesList';
import { SmsSimulator } from '@/components/occurrences/SmsSimulator';
import { AlertSender } from '@/components/occurrences/AlertSender';
import { SurveyManager } from '@/components/occurrences/SurveyManager';
import { RiskDashboard } from '@/components/occurrences/RiskDashboard';

export default function OccurrencesPage() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <MainLayout title="Gestão de Ocorrências">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              Gestão de Ocorrências
            </h1>
            <p className="text-muted-foreground">
              Ocorrências climáticas e fitossanitárias com classificação automática
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Ocorrências</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="surveys" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Inquéritos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <RiskDashboard />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <OccurrencesList />
          </TabsContent>

          <TabsContent value="sms" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SmsSimulator />
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Como funciona o SMS Inbound</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>O agricultor envia um SMS descrevendo a ocorrência</li>
                    <li>O sistema detecta automaticamente o tipo de ocorrência</li>
                    <li>A IA classifica a severidade baseada no conteúdo</li>
                    <li>Uma ocorrência é criada automaticamente no sistema</li>
                    <li>O agricultor recebe confirmação por SMS</li>
                  </ol>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Palavras-chave detectadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {['seca', 'inundação', 'praga', 'doença', 'geada', 'granizo', 'fogo', 'incêndio'].map((word) => (
                      <span key={word} className="px-2 py-1 bg-primary/10 rounded text-xs">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <AlertSender />
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Sobre Alertas Outbound</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Os alertas SMS são enviados para notificar agricultores sobre ocorrências na sua região,
                    permitindo que tomem medidas preventivas ou corretivas.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Alertas baseados em geolocalização</li>
                    <li>✓ Segmentação por província/município</li>
                    <li>✓ Confirmação de entrega simulada</li>
                    <li>✓ Histórico de alertas enviados</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="surveys" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SurveyManager />
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Tipos de Inquérito</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li>
                      <strong>📊 Avaliação de Impacto:</strong> Mede o impacto inicial de uma ocorrência
                    </li>
                    <li>
                      <strong>📝 Relatório de Danos:</strong> Detalha os danos específicos sofridos
                    </li>
                    <li>
                      <strong>🔄 Estado de Recuperação:</strong> Acompanha o progresso da recuperação
                    </li>
                    <li>
                      <strong>📋 Avaliação de Necessidades:</strong> Identifica recursos necessários
                    </li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Fluxo IVR Simulado</h3>
                  <p className="text-sm text-muted-foreground">
                    O sistema suporta inquéritos por chamada telefónica (IVR) onde o agricultor 
                    responde usando o teclado do telefone. A integração real com operadoras 
                    pode ser activada quando necessário.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <OccurrenceForm open={showForm} onOpenChange={setShowForm} />
      </div>
    </MainLayout>
  );
}
