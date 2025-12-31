import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNationalStats, useProvinceStats, useCompositeIndices, calculateCostOfInaction } from '@/hooks/useONAF';
import { toast } from 'sonner';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Calendar,
  Building2,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ReportSection {
  id: string;
  label: string;
  description: string;
}

const reportSections: ReportSection[] = [
  { id: 'executive', label: 'Sumário Executivo', description: 'Visão geral e indicadores principais' },
  { id: 'indices', label: 'Índices Compostos', description: 'Soberania alimentar, risco climático, pressão florestal' },
  { id: 'provinces', label: 'Análise Provincial', description: 'Comparativo entre províncias' },
  { id: 'agriculture', label: 'Sector Agrícola', description: 'Agricultores, produção e certificação' },
  { id: 'forestry', label: 'Sector Florestal', description: 'Licenças, rastreabilidade e infrações' },
  { id: 'climate', label: 'Ocorrências Climáticas', description: 'Eventos, impactos e tendências' },
  { id: 'cost', label: 'Custo da Inação', description: 'Análise de custos e projecções' },
  { id: 'recommendations', label: 'Recomendações', description: 'Propostas de acção prioritária' },
];

export function ReportExporter() {
  const { data: stats } = useNationalStats();
  const { data: provinces } = useProvinceStats();
  const indices = useCompositeIndices(stats);
  const costOfInaction = stats ? calculateCostOfInaction(stats) : null;

  const [selectedSections, setSelectedSections] = useState<string[]>(['executive', 'indices', 'provinces']);
  const [reportTitle, setReportTitle] = useState('Relatório Estratégico ONAF');
  const [reportNotes, setReportNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const generateReport = async () => {
    if (selectedSections.length === 0) {
      toast.error('Seleccione pelo menos uma secção');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate report content
      const reportContent = generateReportContent();
      
      if (reportFormat === 'excel') {
        // Generate CSV for Excel
        downloadAsCSV(reportContent);
      } else {
        // Generate text file (placeholder for PDF)
        downloadAsText(reportContent);
      }

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportContent = () => {
    const lines: string[] = [];
    const date = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: pt });

    lines.push('='.repeat(60));
    lines.push(reportTitle.toUpperCase());
    lines.push(`Gerado em: ${date}`);
    lines.push('='.repeat(60));
    lines.push('');

    if (selectedSections.includes('executive') && stats) {
      lines.push('SUMÁRIO EXECUTIVO');
      lines.push('-'.repeat(40));
      lines.push(`Total de Agricultores: ${stats.totalFarmers.toLocaleString()}`);
      lines.push(`Área Cultivada: ${stats.totalCultivatedArea.toLocaleString()} ha`);
      lines.push(`Produção Total: ${(stats.totalYieldKg / 1000).toLocaleString()} toneladas`);
      lines.push(`Licenças Florestais Activas: ${stats.activeForestLicenses}`);
      lines.push(`Ocorrências Climáticas: ${stats.totalOccurrences}`);
      lines.push('');
    }

    if (selectedSections.includes('indices')) {
      lines.push('ÍNDICES COMPOSTOS');
      lines.push('-'.repeat(40));
      lines.push(`Índice de Soberania Alimentar: ${indices.foodSovereigntyIndex}/100`);
      lines.push(`Índice de Risco Agro-Climático: ${indices.agroClimaticRiskIndex}/100`);
      lines.push(`Índice de Pressão Florestal: ${indices.forestPressureIndex}/100`);
      lines.push(`Índice de Saúde Geral: ${indices.overallHealthIndex}/100`);
      lines.push('');
    }

    if (selectedSections.includes('provinces') && provinces) {
      lines.push('ANÁLISE PROVINCIAL');
      lines.push('-'.repeat(40));
      provinces.slice(0, 10).forEach((p, i) => {
        lines.push(`${i + 1}. ${p.name}: ${p.farmers} agricultores, ${p.cultivatedArea.toFixed(0)} ha`);
      });
      lines.push('');
    }

    if (selectedSections.includes('cost') && costOfInaction) {
      lines.push('CUSTO DA INAÇÃO');
      lines.push('-'.repeat(40));
      lines.push(`Custo Anual: ${costOfInaction.annualCost.toLocaleString()} AOA`);
      lines.push(`Custo 5 Anos: ${costOfInaction.fiveYearCost.toLocaleString()} AOA`);
      lines.push('');
      lines.push('Decomposição:');
      costOfInaction.breakdown.forEach(item => {
        lines.push(`  - ${item.category}: ${item.cost.toLocaleString()} AOA`);
      });
      lines.push('');
    }

    if (reportNotes) {
      lines.push('NOTAS ADICIONAIS');
      lines.push('-'.repeat(40));
      lines.push(reportNotes);
      lines.push('');
    }

    lines.push('='.repeat(60));
    lines.push('Documento gerado pelo ONAF - Observatório Nacional Agro-Florestal');
    lines.push('Sistema de Informação e Gestão Agrícola e Florestal (SIGAF)');

    return lines.join('\n');
  };

  const downloadAsText = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = (content: string) => {
    // Convert report to CSV format
    const csvLines: string[] = [];
    csvLines.push('Secção,Indicador,Valor');
    
    if (stats) {
      csvLines.push(`Sumário,Total Agricultores,${stats.totalFarmers}`);
      csvLines.push(`Sumário,Área Cultivada (ha),${stats.totalCultivatedArea}`);
      csvLines.push(`Sumário,Produção (kg),${stats.totalYieldKg}`);
      csvLines.push(`Índices,Soberania Alimentar,${indices.foodSovereigntyIndex}`);
      csvLines.push(`Índices,Risco Climático,${indices.agroClimaticRiskIndex}`);
      csvLines.push(`Índices,Pressão Florestal,${indices.forestPressureIndex}`);
    }

    if (provinces) {
      provinces.forEach(p => {
        csvLines.push(`Províncias,${p.name} - Agricultores,${p.farmers}`);
        csvLines.push(`Províncias,${p.name} - Área (ha),${p.cultivatedArea}`);
      });
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Configuration */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Relatório</CardTitle>
            <CardDescription>Personalize o conteúdo e formato do relatório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título do Relatório</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Notas Adicionais</Label>
              <Textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Observações, contexto ou recomendações..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label className="mb-3 block">Formato de Exportação</Label>
              <div className="flex gap-3">
                <Button
                  variant={reportFormat === 'pdf' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setReportFormat('pdf')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Texto/PDF
                </Button>
                <Button
                  variant={reportFormat === 'excel' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setReportFormat('excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel/CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={generateReport}
          disabled={isGenerating || selectedSections.length === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              A gerar relatório...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Exportar Relatório
            </>
          )}
        </Button>
      </div>

      {/* Section Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Secções do Relatório
            <Badge variant="secondary">
              {selectedSections.length} seleccionadas
            </Badge>
          </CardTitle>
          <CardDescription>Seleccione as secções a incluir no relatório</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportSections.map((section) => (
              <div
                key={section.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSections.includes(section.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:bg-muted/50'
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <Checkbox
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.label}</span>
                    {selectedSections.includes(section.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSections(reportSections.map(s => s.id))}
            >
              Seleccionar Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSections([])}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Data: {format(new Date(), "dd/MM/yyyy", { locale: pt })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>SIGAF - Ministério da Agricultura e Florestas</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Formato: {reportFormat === 'pdf' ? 'Texto/PDF' : 'Excel/CSV'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
