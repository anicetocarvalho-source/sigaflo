import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Target, TrendingUp, Download, Plus, 
  Settings, Scale, Landmark, Edit, Trash2, CheckCircle2,
  AlertTriangle, BarChart3
} from 'lucide-react';
import { useRiceParameters, useRiceStats } from '@/hooks/useRice';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const parameterSchema = z.object({
  parameter_name: z.string().min(1, 'Nome é obrigatório'),
  parameter_value: z.coerce.number(),
  unit: z.string().optional(),
  description: z.string().optional()
});

type ParameterFormData = z.infer<typeof parameterSchema>;

export default function RicePoliciesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<any>(null);

  const queryClient = useQueryClient();
  const { data: parameters, isLoading } = useRiceParameters();
  const { data: stats } = useRiceStats();

  const form = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      parameter_name: '',
      parameter_value: 0,
      unit: '',
      description: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ParameterFormData) => {
      const { error } = await supabase
        .from('rice_parameters')
        .insert([{
          parameter_name: data.parameter_name,
          parameter_value: data.parameter_value,
          unit: data.unit || null,
          description: data.description || null
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-parameters'] });
      toast.success('Parâmetro adicionado com sucesso');
      setFormOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ParameterFormData }) => {
      const { error } = await supabase
        .from('rice_parameters')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-parameters'] });
      toast.success('Parâmetro atualizado com sucesso');
      setEditingParam(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rice_parameters')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-parameters'] });
      toast.success('Parâmetro removido com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    }
  });

  const handleEdit = (param: any) => {
    setEditingParam(param);
    form.reset({
      parameter_name: param.parameter_name,
      parameter_value: param.parameter_value,
      unit: param.unit || '',
      description: param.description || ''
    });
  };

  const handleSubmit = (data: ParameterFormData) => {
    if (editingParam) {
      updateMutation.mutate({ id: editingParam.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Get key metrics
  const keyParams = useMemo(() => {
    if (!parameters) return {};
    return parameters.reduce((acc: Record<string, any>, p) => {
      acc[p.parameter_name] = { value: p.parameter_value, unit: p.unit, description: p.description };
      return acc;
    }, {});
  }, [parameters]);

  // Calculate self-sufficiency progress
  const selfSufficiencyData = useMemo(() => {
    const target = keyParams['meta_autossuficiencia']?.value || 50;
    const currentYear = new Date().getFullYear();
    const production = stats?.productionByYear?.[currentYear]?.production || 0;
    const imports = stats?.importsByYear?.[currentYear]?.volume || 0;
    const total = production + imports;
    const currentRate = total > 0 ? (production / total) * 100 : 0;
    
    return {
      target,
      current: Math.round(currentRate * 10) / 10,
      production,
      imports,
      total
    };
  }, [keyParams, stats]);

  // Strategic programs (mock data for now - could be stored in DB)
  const strategicPrograms = [
    {
      id: 1,
      name: 'PLANA - Plano Nacional de Arroz',
      status: 'active',
      startYear: 2020,
      endYear: 2025,
      budget: 50000000000,
      objectives: ['Aumentar produção nacional', 'Reduzir dependência de importações', 'Melhorar infraestruturas de irrigação'],
      progress: 45
    },
    {
      id: 2,
      name: 'Programa de Mecanização Agrícola',
      status: 'active',
      startYear: 2022,
      endYear: 2026,
      budget: 15000000000,
      objectives: ['Distribuir tratores e equipamentos', 'Formar operadores', 'Criar centros de manutenção'],
      progress: 30
    },
    {
      id: 3,
      name: 'Reabilitação de Perímetros Irrigados',
      status: 'planned',
      startYear: 2024,
      endYear: 2028,
      budget: 80000000000,
      objectives: ['Reabilitar 50.000 ha', 'Instalar sistemas de bombagem', 'Construir canais de drenagem'],
      progress: 10
    }
  ];

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-AO').format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  if (isLoading) {
    return (
      <MainLayout title="Políticas de Arroz">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Políticas de Arroz">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Landmark className="h-8 w-8 text-indigo-600" />
              Políticas e Estratégia do Arroz
            </h1>
            <p className="text-muted-foreground">
              Parâmetros estratégicos, metas e programas nacionais
            </p>
          </div>
          <Dialog open={formOpen || !!editingParam} onOpenChange={(open) => {
            if (!open) {
              setFormOpen(false);
              setEditingParam(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parâmetro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingParam ? 'Editar Parâmetro' : 'Novo Parâmetro Estratégico'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="parameter_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Parâmetro</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: meta_autossuficiencia" {...field} />
                        </FormControl>
                        <FormDescription>Use snake_case sem espaços</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parameter_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: %, ton, kg/ha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva o parâmetro..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setFormOpen(false);
                      setEditingParam(null);
                      form.reset();
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) ? 'A guardar...' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Self-sufficiency Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Meta de Autossuficiência
              </CardTitle>
              <CardDescription>Progresso em direção à meta nacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="90%" 
                    data={[
                      { name: 'Meta', value: selfSufficiencyData.target, fill: '#e0e7ff' },
                      { name: 'Atual', value: selfSufficiencyData.current, fill: '#6366f1' }
                    ]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center -mt-16">
                  <p className="text-4xl font-bold text-indigo-600">{selfSufficiencyData.current}%</p>
                  <p className="text-sm text-muted-foreground">de {selfSufficiencyData.target}% meta</p>
                </div>
                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Produção Nacional</span>
                    <span className="font-medium text-green-600">{formatNumber(selfSufficiencyData.production)} ton</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Importações</span>
                    <span className="font-medium text-amber-600">{formatNumber(selfSufficiencyData.imports)} ton</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span>Total Disponível</span>
                    <span className="font-medium">{formatNumber(selfSufficiencyData.total)} ton</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Indicators */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Indicadores-Chave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Consumo Per Capita Estimado</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {keyParams['consumo_per_capita_estimado']?.value || 25} {keyParams['consumo_per_capita_estimado']?.unit || 'kg/ano'}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Produtividade Média Alvo</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {keyParams['produtividade_media_alvo']?.value || 4000} {keyParams['produtividade_media_alvo']?.unit || 'kg/ha'}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Área Irrigada Alvo</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {formatNumber(keyParams['area_irrigada_alvo']?.value || 100000)} {keyParams['area_irrigada_alvo']?.unit || 'ha'}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Preço Referência</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {formatNumber(keyParams['preco_referencia_kg']?.value || 350)} {keyParams['preco_referencia_kg']?.unit || 'AOA/kg'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Programs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Programas Estratégicos
            </CardTitle>
            <CardDescription>Iniciativas nacionais para o sector do arroz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategicPrograms.map((program) => (
                <div 
                  key={program.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{program.name}</h3>
                        <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                          {program.status === 'active' ? 'Em Curso' : 'Planeado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {program.startYear} - {program.endYear} | Orçamento: {formatCurrency(program.budget)}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {program.objectives.map((obj, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Progresso</span>
                        <span className="text-sm text-muted-foreground">{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Parameters Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Parâmetros do Sistema ({parameters?.length || 0})
            </CardTitle>
            <CardDescription>Configurações e valores de referência para cálculos e alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parâmetro</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters?.map((param) => (
                    <TableRow key={param.id}>
                      <TableCell className="font-mono text-sm">
                        {param.parameter_name}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(param.parameter_value)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{param.unit || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                        {param.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(param)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja remover este parâmetro?')) {
                                deleteMutation.mutate(param.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!parameters || parameters.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum parâmetro configurado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Policy Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Diretrizes Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm">Priorizar zonas de alto potencial produtivo (Cuanza Sul, Malanje, Benguela)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm">Investir em infraestruturas de irrigação e drenagem</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm">Promover variedades adaptadas ao clima local</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm">Capacitar produtores em técnicas modernas de cultivo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm">Facilitar acesso a crédito agrícola e seguros</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Desafios Identificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                  <span className="text-sm">Dependência elevada de importações (70%+ do consumo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                  <span className="text-sm">Infraestruturas de irrigação degradadas ou inexistentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                  <span className="text-sm">Baixa mecanização e uso limitado de insumos</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                  <span className="text-sm">Custos de produção elevados face ao arroz importado</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                  <span className="text-sm">Perdas pós-colheita significativas</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
