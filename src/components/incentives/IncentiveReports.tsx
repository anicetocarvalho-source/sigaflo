import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  BarChart3,
  MapPin,
  TrendingUp,
  Users,
  Coins,
  Scale
} from 'lucide-react';
import { IncentiveProgram, useAllocations, useImpacts } from '@/hooks/useIncentives';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface IncentiveReportsProps {
  programs: IncentiveProgram[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function IncentiveReports({ programs }: IncentiveReportsProps) {
  const [reportType, setReportType] = useState<string>('cost-benefit');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  const { data: allocations } = useAllocations();
  const { data: impacts } = useImpacts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Cost-Benefit Analysis
  const costBenefitData = programs.map(program => {
    const programAllocations = allocations?.filter(a => a.program_id === program.id) || [];
    const disbursedAmount = programAllocations
      .filter(a => a.status === 'disbursed')
      .reduce((sum, a) => sum + a.amount_aoa, 0);
    
    const programImpacts = programAllocations.flatMap(a => 
      impacts?.filter(i => i.allocation_id === a.id) || []
    );
    
    const avgProductionIncrease = programImpacts.length > 0
      ? programImpacts.reduce((sum, i) => sum + (i.production_change_pct || 0), 0) / programImpacts.length
      : 0;

    // Estimated benefit (simplified calculation)
    const estimatedBenefit = disbursedAmount * (1 + avgProductionIncrease / 100);

    return {
      name: program.code,
      fullName: program.name,
      cost: disbursedAmount,
      benefit: estimatedBenefit,
      roi: disbursedAmount > 0 ? ((estimatedBenefit - disbursedAmount) / disbursedAmount) * 100 : 0,
    };
  });

  // Territorial Impact
  const territorialData = [
    { province: 'Luanda', beneficiaries: 450, amount: 225000000 },
    { province: 'Huíla', beneficiaries: 320, amount: 160000000 },
    { province: 'Benguela', beneficiaries: 280, amount: 140000000 },
    { province: 'Cuanza Sul', beneficiaries: 210, amount: 105000000 },
    { province: 'Malanje', beneficiaries: 180, amount: 90000000 },
    { province: 'Outras', beneficiaries: 560, amount: 280000000 },
  ];

  // Sector Distribution
  const sectorData = programs.reduce((acc, program) => {
    const existing = acc.find(s => s.name === program.sector);
    if (existing) {
      existing.value += program.budget_aoa || 0;
      existing.count += 1;
    } else {
      acc.push({
        name: program.sector === 'agriculture' ? 'Agricultura' :
              program.sector === 'forestry' ? 'Florestal' :
              program.sector === 'coffee' ? 'Café' : 'Arroz',
        value: program.budget_aoa || 0,
        count: 1,
      });
    }
    return acc;
  }, [] as { name: string; value: number; count: number }[]);

  const exportReport = (format: 'pdf' | 'excel') => {
    // In a real implementation, this would generate and download the file
    const data = reportType === 'cost-benefit' 
      ? costBenefitData 
      : reportType === 'territorial' 
        ? territorialData 
        : sectorData;

    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-incentivos-${reportType}.${format === 'pdf' ? 'txt' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Estratégicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost-benefit">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Custo vs Benefício
                  </div>
                </SelectItem>
                <SelectItem value="territorial">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Impacto Territorial
                  </div>
                </SelectItem>
                <SelectItem value="sector">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Distribuição Setorial
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Programas</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => exportReport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={() => exportReport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost-Benefit Report */}
      {reportType === 'cost-benefit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Custo vs Benefício por Programa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costBenefitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={80} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => costBenefitData.find(d => d.name === label)?.fullName}
                  />
                  <Legend />
                  <Bar dataKey="cost" fill="#ef4444" name="Custo" />
                  <Bar dataKey="benefit" fill="#10b981" name="Benefício Estimado" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Retorno sobre Investimento (ROI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costBenefitData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant={item.roi > 0 ? 'default' : 'destructive'}>
                        {item.roi >= 0 ? '+' : ''}{item.roi.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Custo: {formatCurrency(item.cost)}</span>
                      <span>Benefício: {formatCurrency(item.benefit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Territorial Impact Report */}
      {reportType === 'territorial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Beneficiários por Província
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={territorialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="beneficiaries" fill="#3b82f6" name="Beneficiários" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Investimento por Província
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={territorialData}
                    dataKey="amount"
                    nameKey="province"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ province, percent }) => `${province}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {territorialData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sector Distribution Report */}
      {reportType === 'sector' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Orçamento por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo por Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorData.map((sector, index) => (
                  <div key={sector.name} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{sector.name}</span>
                      </div>
                      <Badge variant="outline">{sector.count} programas</Badge>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(sector.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
