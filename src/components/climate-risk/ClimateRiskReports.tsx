import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClimateRiskStats, useProvinceRiskProfiles } from '@/hooks/useClimateRisk';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingDown, 
  Building2, 
  Shield,
  Printer,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  audience: string;
  icon: React.ElementType;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'cost-benefit',
    name: 'Relatório Custo-Benefício',
    description: 'Análise do retorno sobre investimentos em mitigação de riscos climáticos',
    audience: 'Ministério das Finanças',
    icon: BarChart3,
  },
  {
    id: 'territorial-impact',
    name: 'Impacto Territorial',
    description: 'Distribuição geográfica de perdas e zonas de maior vulnerabilidade',
    audience: 'Governos Provinciais',
    icon: TrendingDown,
  },
  {
    id: 'insurance-summary',
    name: 'Sumário para Seguradoras',
    description: 'Dados consolidados para cálculo de prémios e coberturas',
    audience: 'Companhias de Seguros',
    icon: Shield,
  },
  {
    id: 'compensation-request',
    name: 'Pedido de Compensação',
    description: 'Documentação formal para solicitar fundos de emergência',
    audience: 'Tesouro Nacional',
    icon: Building2,
  },
];

export function ClimateRiskReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [period, setPeriod] = useState('year');
  const { data: stats } = useClimateRiskStats();
  const { data: provinceProfiles } = useProvinceRiskProfiles();

  const handleGenerate = (reportId: string) => {
    toast.success(`Relatório "${reportTemplates.find(r => r.id === reportId)?.name}" gerado com sucesso`);
  };

  const handleExport = (format: string) => {
    toast.success(`Exportado em formato ${format.toUpperCase()}`);
  };

  const handleEmail = () => {
    toast.success('Relatório enviado por e-mail');
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} Mil Milhões Kz`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} Milhões Kz`;
    }
    return `${value.toLocaleString()} Kz`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Modelos de Relatório</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {reportTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedReport === template.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedReport(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <template.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">{template.audience}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => handleGenerate(template.id)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Gerar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pré-visualização do Relatório</CardTitle>
                  <CardDescription>
                    Relatório de Risco Climático e Impacto na Produção Agrícola
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Este Mês</SelectItem>
                      <SelectItem value="quarter">Trimestre</SelectItem>
                      <SelectItem value="year">Este Ano</SelectItem>
                      <SelectItem value="all">Todo Período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Header */}
              <div className="p-6 border rounded-lg bg-muted/30">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">REPÚBLICA DE ANGOLA</h2>
                  <p className="text-sm text-muted-foreground">Ministério da Agricultura e Florestas</p>
                  <h3 className="text-lg font-semibold mt-4">
                    Relatório de Risco Climático e Seguro Agrícola
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Período: Janeiro - Dezembro 2024
                  </p>
                </div>

                {/* Summary Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold border-b pb-2">1. Resumo Executivo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Total de Eventos</p>
                      <p className="text-xl font-bold">{stats?.total_events || 0}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Perdas Totais</p>
                      <p className="text-xl font-bold">{formatCurrency(stats?.total_loss_aoa || 0)}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Área Afectada</p>
                      <p className="text-xl font-bold">{(stats?.total_affected_area_ha || 0).toLocaleString()} ha</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Agricultores</p>
                      <p className="text-xl font-bold">{(stats?.total_affected_farmers || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Province Analysis */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold border-b pb-2">2. Análise por Província</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Província</th>
                          <th className="text-right py-2">Eventos</th>
                          <th className="text-right py-2">Área (ha)</th>
                          <th className="text-right py-2">Perdas</th>
                          <th className="text-right py-2">Risco</th>
                        </tr>
                      </thead>
                      <tbody>
                        {provinceProfiles?.slice(0, 5).map((province) => (
                          <tr key={province.province_id} className="border-b">
                            <td className="py-2">{province.province_name}</td>
                            <td className="text-right py-2">{province.events_count}</td>
                            <td className="text-right py-2">{province.total_affected_area_ha.toLocaleString()}</td>
                            <td className="text-right py-2">{formatCurrency(province.total_loss_aoa)}</td>
                            <td className="text-right py-2">
                              <Badge variant={
                                province.risk_level === 'critical' ? 'destructive' :
                                province.risk_level === 'high' ? 'default' : 'secondary'
                              }>
                                {province.risk_score}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold border-b pb-2">3. Recomendações</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Expandir programas de seguros agrícolas para províncias de alto risco</li>
                    <li>Implementar sistemas de alerta precoce em zonas vulneráveis</li>
                    <li>Promover técnicas de agricultura resiliente ao clima</li>
                    <li>Criar fundo de emergência para compensações rápidas</li>
                    <li>Desenvolver parcerias público-privadas para cobertura de seguros</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('xlsx')}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button onClick={handleEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por E-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
