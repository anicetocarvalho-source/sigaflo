import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Landmark, 
  Shield, 
  Users,
  TrendingUp,
  MapPin,
  AlertTriangle,
  PieChart
} from 'lucide-react';
import { useCreditInsuranceStats, useFinancialProfiles } from '@/hooks/useCreditInsurance';
import { useProvinces } from '@/hooks/useFarmers';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

export function InstitutionalDashboard() {
  const [activeTab, setActiveTab] = useState('banks');
  const { data: stats } = useCreditInsuranceStats();
  const { data: profiles } = useFinancialProfiles();
  const { data: provinces } = useProvinces();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  // Risk distribution data
  const riskData = [
    { name: 'Baixo', value: stats?.riskDistribution.low || 0, color: '#22c55e' },
    { name: 'Médio', value: stats?.riskDistribution.medium || 0, color: '#eab308' },
    { name: 'Alto', value: stats?.riskDistribution.high || 0, color: '#ef4444' },
  ];

  // Score distribution
  const scoreRanges = [
    { range: '0-20', count: profiles?.filter(p => p.credit_score <= 20).length || 0 },
    { range: '21-40', count: profiles?.filter(p => p.credit_score > 20 && p.credit_score <= 40).length || 0 },
    { range: '41-60', count: profiles?.filter(p => p.credit_score > 40 && p.credit_score <= 60).length || 0 },
    { range: '61-80', count: profiles?.filter(p => p.credit_score > 60 && p.credit_score <= 80).length || 0 },
    { range: '81-100', count: profiles?.filter(p => p.credit_score > 80).length || 0 },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="banks" className="gap-2">
            <Landmark className="h-4 w-4" />
            Bancos
          </TabsTrigger>
          <TabsTrigger value="insurers" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguradoras
          </TabsTrigger>
          <TabsTrigger value="state" className="gap-2">
            <Building2 className="h-4 w-4" />
            Estado
          </TabsTrigger>
        </TabsList>

        {/* Banks Dashboard */}
        <TabsContent value="banks" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Agricultores Elegíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.eligibleForCredit || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {stats?.totalProfiles || 0} perfis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Score Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgCreditScore || 0}</div>
                <Progress value={stats?.avgCreditScore || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Crédito Potencial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalCreditRecommended || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Valor total recomendado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalDossiers ? Math.round((stats.approvedDossiers / stats.totalDossiers) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.approvedDossiers || 0} de {stats?.totalDossiers || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição de Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreRanges}>
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insurers Dashboard */}
        <TabsContent value="insurers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Elegíveis para Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.eligibleForInsurance || 0}
                </div>
                <p className="text-xs text-muted-foreground">Agricultores com perfil</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risco Baixo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.riskDistribution.low || 0}
                </div>
                <p className="text-xs text-muted-foreground">Classe A/B</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risco Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats?.riskDistribution.medium || 0}
                </div>
                <p className="text-xs text-muted-foreground">Classe C</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risco Alto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.riskDistribution.high || 0}
                </div>
                <p className="text-xs text-muted-foreground">Classe D/E</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risco por Zona/Cultura</CardTitle>
              <CardDescription>
                Análise de risco agrícola por região geográfica e tipo de cultura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {provinces?.slice(0, 5).map((province, idx) => (
                  <div key={province.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{province.name}</div>
                    <div className="flex-1">
                      <Progress 
                        value={70 - idx * 10} 
                        className="h-3"
                      />
                    </div>
                    <div className="w-20 text-right">
                      <Badge variant={idx < 2 ? 'default' : idx < 4 ? 'secondary' : 'destructive'}>
                        {idx < 2 ? 'Baixo' : idx < 4 ? 'Médio' : 'Alto'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* State Dashboard */}
        <TabsContent value="state" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Inclusão Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalProfiles ? Math.round((stats.eligibleForCredit / stats.totalProfiles) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Taxa de elegibilidade</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Crédito Activado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalCreditRecommended || 0)}</div>
                <p className="text-xs text-muted-foreground">Potencial de crédito</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Dossiês Submetidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.submittedDossiers || 0}</div>
                <p className="text-xs text-muted-foreground">Em análise</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Alertas Sistémicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.unreadAlerts || 0}</div>
                <p className="text-xs text-muted-foreground">Requerem atenção</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risco Sistémico por Província</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {provinces?.slice(0, 6).map((province, idx) => (
                    <div key={province.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{province.name}</span>
                      </div>
                      <Badge variant={idx % 3 === 0 ? 'destructive' : idx % 3 === 1 ? 'secondary' : 'default'}>
                        {idx % 3 === 0 ? 'Alto' : idx % 3 === 1 ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Indicadores de Inclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Agricultores com Perfil Financeiro</span>
                      <span>{stats?.totalProfiles || 0}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Elegíveis para Crédito</span>
                      <span>{stats?.eligibleForCredit || 0}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Elegíveis para Seguro</span>
                      <span>{stats?.eligibleForInsurance || 0}</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Com Dossiê Completo</span>
                      <span>{stats?.totalDossiers || 0}</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
