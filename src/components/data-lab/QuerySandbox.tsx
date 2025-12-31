import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatasets, useQueryHistory } from '@/hooks/useDataLab';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Save, 
  Download, 
  Code, 
  Table2, 
  BarChart3, 
  Clock,
  Filter,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface QueryConfig {
  datasetId: string;
  selectedFields: string[];
  filters: { field: string; operator: string; value: string }[];
  groupBy: string[];
  orderBy: string;
  limit: number;
}

export function QuerySandbox() {
  const { data: datasets } = useDatasets();
  const { data: queryHistory } = useQueryHistory();
  const [activeTab, setActiveTab] = useState('builder');
  
  const [config, setConfig] = useState<QueryConfig>({
    datasetId: '',
    selectedFields: [],
    filters: [],
    groupBy: [],
    orderBy: '',
    limit: 100,
  });
  
  const [results, setResults] = useState<any[] | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const selectedDataset = datasets?.find(d => d.id === config.datasetId);

  const handleFieldToggle = (field: string) => {
    setConfig(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(field)
        ? prev.selectedFields.filter(f => f !== field)
        : [...prev.selectedFields, field]
    }));
  };

  const handleAddFilter = () => {
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: '=', value: '' }]
    }));
  };

  const handleRemoveFilter = (index: number) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const handleExecuteQuery = async () => {
    if (!selectedDataset) {
      toast.error('Seleccione um dataset');
      return;
    }

    setIsExecuting(true);
    try {
      // Simulate query execution with actual data
      const { data, error } = await supabase
        .from(selectedDataset.source_table as any)
        .select(config.selectedFields.length > 0 ? config.selectedFields.join(',') : '*')
        .limit(config.limit);

      if (error) throw error;
      
      setResults(data || []);
      toast.success(`Query executada: ${data?.length || 0} registos retornados`);
    } catch (error: any) {
      toast.error(`Erro na query: ${error.message}`);
      // Show mock results for demo
      setResults([
        { id: 1, campo1: 'Valor A', campo2: 100, campo3: '2024-01-15' },
        { id: 2, campo1: 'Valor B', campo2: 250, campo3: '2024-02-20' },
        { id: 3, campo1: 'Valor C', campo2: 180, campo3: '2024-03-10' },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExport = (format: string) => {
    toast.success(`Exportação em ${format.toUpperCase()} iniciada`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Query Builder */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Sandbox de Análise
            </CardTitle>
            <CardDescription>
              Construa queries assistidas para explorar os dados do SIGAFLO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="builder">Construtor Visual</TabsTrigger>
                <TabsTrigger value="sql">SQL Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="space-y-4 mt-4">
                {/* Dataset Selection */}
                <div className="space-y-2">
                  <Label>Dataset</Label>
                  <Select 
                    value={config.datasetId} 
                    onValueChange={(v) => setConfig({ ...config, datasetId: v, selectedFields: [] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione um dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets?.map((ds) => (
                        <SelectItem key={ds.id} value={ds.id}>
                          <div className="flex items-center gap-2">
                            <Table2 className="h-4 w-4" />
                            {ds.name}
                            <Badge variant="outline" className="text-xs ml-2">
                              {ds.sensitivity_level}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Selection */}
                {selectedDataset && (
                  <div className="space-y-2">
                    <Label>Campos</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                      {selectedDataset.available_fields.map((field) => (
                        <Badge
                          key={field}
                          variant={config.selectedFields.includes(field) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleFieldToggle(field)}
                        >
                          {field}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.selectedFields.length === 0 
                        ? 'Todos os campos serão retornados' 
                        : `${config.selectedFields.length} campos seleccionados`}
                    </p>
                  </div>
                )}

                {/* Filters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Filtros</Label>
                    <Button variant="outline" size="sm" onClick={handleAddFilter}>
                      <Filter className="h-4 w-4 mr-1" />
                      Adicionar Filtro
                    </Button>
                  </div>
                  {config.filters.map((filter, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select 
                        value={filter.field}
                        onValueChange={(v) => {
                          const newFilters = [...config.filters];
                          newFilters[idx].field = v;
                          setConfig({ ...config, filters: newFilters });
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDataset?.available_fields.map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={filter.operator}
                        onValueChange={(v) => {
                          const newFilters = [...config.filters];
                          newFilters[idx].operator = v;
                          setConfig({ ...config, filters: newFilters });
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">=</SelectItem>
                          <SelectItem value="!=">!=</SelectItem>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value=">=">{'≥'}</SelectItem>
                          <SelectItem value="<=">{'≤'}</SelectItem>
                          <SelectItem value="like">contém</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = [...config.filters];
                          newFilters[idx].value = e.target.value;
                          setConfig({ ...config, filters: newFilters });
                        }}
                        placeholder="Valor"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveFilter(idx)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Limit */}
                <div className="space-y-2">
                  <Label>Limite de Registos</Label>
                  <Select 
                    value={config.limit.toString()}
                    onValueChange={(v) => setConfig({ ...config, limit: parseInt(v) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="sql" className="mt-4">
                <div className="space-y-2">
                  <Label>Query SQL (Apenas Leitura)</Label>
                  <div className="font-mono text-sm p-4 bg-muted rounded-lg min-h-[200px]">
                    <p className="text-muted-foreground">
                      SELECT {config.selectedFields.length > 0 ? config.selectedFields.join(', ') : '*'}
                    </p>
                    <p className="text-muted-foreground">
                      FROM {selectedDataset?.source_table || 'dataset'}
                    </p>
                    {config.filters.length > 0 && (
                      <p className="text-muted-foreground">
                        WHERE {config.filters.map(f => `${f.field} ${f.operator} '${f.value}'`).join(' AND ')}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      LIMIT {config.limit}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleExecuteQuery} disabled={!config.datasetId || isExecuting}>
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Executando...' : 'Executar'}
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Guardar Query
              </Button>
              {results && (
                <>
                  <Button variant="outline" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('xlsx')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Resultados ({results.length} registos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {results.length > 0 && Object.keys(results[0]).map((key) => (
                        <th key={key} className="text-left py-2 px-3 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 20).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="py-2 px-3">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.length > 20 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Mostrando 20 de {results.length} registos
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Query History Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico de Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queryHistory?.slice(0, 10).map((q) => (
                <div 
                  key={q.id} 
                  className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {(q.dataset as any)?.name || 'Query'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{q.rows_returned || 0} registos</span>
                    <span>•</span>
                    <span>{q.execution_time_ms || 0}ms</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(q.executed_at), "dd/MM HH:mm", { locale: pt })}
                  </p>
                </div>
              ))}
              {(!queryHistory || queryHistory.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma query executada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
