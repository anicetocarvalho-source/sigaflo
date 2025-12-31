import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Database, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Sprout,
  FileCheck,
  CloudRain,
  Wheat,
  Ship,
  DollarSign,
  PieChart,
  Bell,
  Settings
} from 'lucide-react';

interface SeedResult {
  success: boolean;
  timestamp?: string;
  totals?: Record<string, number>;
  error?: string;
}

const DATA_ICONS: Record<string, React.ElementType> = {
  farmers: Users,
  production_history: Sprout,
  certificates: FileCheck,
  climate_occurrences: CloudRain,
  rice_production: Wheat,
  rice_imports: Ship,
  rice_prices: DollarSign,
  rice_consumption: PieChart,
  rice_alerts: Bell,
  rice_parameters: Settings,
};

const DATA_LABELS: Record<string, string> = {
  farmers: 'Agricultores',
  production_history: 'Histórico de Produção',
  certificates: 'Certificados',
  climate_occurrences: 'Ocorrências Climáticas',
  rice_production: 'Produção de Arroz',
  rice_imports: 'Importações de Arroz',
  rice_prices: 'Preços de Arroz',
  rice_consumption: 'Consumo de Arroz',
  rice_alerts: 'Alertas de Arroz',
  rice_parameters: 'Parâmetros de Arroz',
};

export function SeedDataPanel() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setProgress(10);
      setResult(null);

      toast.info('A iniciar processo de seed...', { duration: 2000 });
      
      setProgress(30);

      const { data, error } = await supabase.functions.invoke('seed-demo-data');

      setProgress(90);

      if (error) {
        throw error;
      }

      setProgress(100);
      setResult(data);

      if (data.success) {
        const totalRecords = Object.values(data.totals || {}).reduce((sum: number, val) => sum + (val as number), 0);
        toast.success(`Dados de demonstração criados com sucesso! ${totalRecords} registos inseridos.`);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (error: any) {
      console.error('Seed error:', error);
      setResult({ success: false, error: error.message || 'Erro ao criar dados' });
      toast.error('Erro ao criar dados de demonstração: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Dados de Demonstração</CardTitle>
            <CardDescription>
              Preencher a base de dados com dados realistas para testes e demonstrações
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="font-medium mb-2">Dados que serão criados:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {Object.entries(DATA_LABELS).map(([key, label]) => {
              const Icon = DATA_ICONS[key] || Database;
              return (
                <div key={key} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isSeeding && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>A processar...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {result && (
          <div className={`rounded-lg p-4 ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-400">Seed concluído com sucesso</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">Erro no processo de seed</span>
                </>
              )}
            </div>
            
            {result.success && result.totals && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(result.totals).map(([key, value]) => {
                  const Icon = DATA_ICONS[key] || Database;
                  return (
                    <div key={key} className="flex items-center justify-between bg-background/50 rounded px-2 py-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{DATA_LABELS[key] || key}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{value}</Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {result.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            {result.timestamp && (
              <p className="text-xs text-muted-foreground mt-2">
                Executado em: {new Date(result.timestamp).toLocaleString('pt-AO')}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSeedData} 
            disabled={isSeeding}
            className="flex-1"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                A criar dados...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Criar Dados de Demonstração
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Este processo irá adicionar dados de teste à base de dados. 
          Use apenas em ambientes de desenvolvimento ou demonstração.
        </p>
      </CardContent>
    </Card>
  );
}
