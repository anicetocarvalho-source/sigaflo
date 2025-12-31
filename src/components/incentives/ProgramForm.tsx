import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { 
  useIncentiveProgram, 
  useCreateProgram, 
  useUpdateProgram,
  useEligibilityRules,
  useCreateRule,
  useDeleteRule,
  EligibilityRule
} from '@/hooks/useIncentives';

const programSchema = z.object({
  code: z.string().min(3, 'Código deve ter pelo menos 3 caracteres'),
  name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  program_type: z.enum(['subsidy', 'credit', 'tax_benefit', 'technical_support']),
  sector: z.enum(['agriculture', 'forestry', 'coffee', 'rice']),
  budget_aoa: z.number().min(0).optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  target_beneficiaries: z.number().optional(),
});

const ruleSchema = z.object({
  rule_name: z.string().min(3),
  rule_type: z.string(),
  operator: z.string(),
  value: z.string(),
  is_mandatory: z.boolean(),
  weight: z.number().min(1).max(10),
});

interface ProgramFormProps {
  programId?: string | null;
  onClose: () => void;
  rulesOnly?: boolean;
}

export function ProgramForm({ programId, onClose, rulesOnly = false }: ProgramFormProps) {
  const [showRuleForm, setShowRuleForm] = useState(false);
  
  const { data: program } = useIncentiveProgram(programId || '');
  const { data: rules } = useEligibilityRules(programId || '');
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const createRule = useCreateRule();
  const deleteRule = useDeleteRule();

  const form = useForm({
    resolver: zodResolver(programSchema),
    defaultValues: {
      code: program?.code || '',
      name: program?.name || '',
      description: program?.description || '',
      program_type: program?.program_type || 'subsidy',
      sector: program?.sector || 'agriculture',
      budget_aoa: program?.budget_aoa || 0,
      start_date: program?.start_date || new Date().toISOString().split('T')[0],
      end_date: program?.end_date || '',
      target_beneficiaries: program?.target_beneficiaries || undefined,
    },
  });

  const ruleForm = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      rule_name: '',
      rule_type: 'farmer_type',
      operator: 'equals',
      value: '',
      is_mandatory: true,
      weight: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof programSchema>) => {
    if (programId) {
      await updateProgram.mutateAsync({ id: programId, ...data });
    } else {
      await createProgram.mutateAsync(data);
    }
    onClose();
  };

  const onAddRule = async (data: z.infer<typeof ruleSchema>) => {
    if (!programId) return;
    await createRule.mutateAsync({ ...data, program_id: programId });
    ruleForm.reset();
    setShowRuleForm(false);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!programId) return;
    await deleteRule.mutateAsync({ id: ruleId, programId });
  };

  const ruleTypes = [
    { value: 'farmer_type', label: 'Tipo de Agricultor' },
    { value: 'province', label: 'Província' },
    { value: 'area_min', label: 'Área Mínima (ha)' },
    { value: 'area_max', label: 'Área Máxima (ha)' },
    { value: 'production_min', label: 'Produção Mínima (kg)' },
    { value: 'crop_type', label: 'Tipo de Cultura' },
    { value: 'certification', label: 'Certificação' },
    { value: 'reputation_min', label: 'Reputação Mínima' },
  ];

  const operators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Diferente de' },
    { value: 'greater_than', label: 'Maior que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'contains', label: 'Contém' },
    { value: 'in_list', label: 'Na lista' },
  ];

  if (rulesOnly && programId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            Regras para: {program?.name || 'Programa'}
          </h3>
          <Button size="sm" onClick={() => setShowRuleForm(!showRuleForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Regra
          </Button>
        </div>

        {showRuleForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nova Regra</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...ruleForm}>
                <form onSubmit={ruleForm.handleSubmit(onAddRule)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={ruleForm.control}
                      name="rule_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Regra</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Agricultor Familiar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="rule_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ruleTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={ruleForm.control}
                      name="operator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operador</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input placeholder="Valor de comparação" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ruleForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={10}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowRuleForm(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createRule.isPending}>
                      Adicionar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {rules?.map((rule: EligibilityRule) => (
            <Card key={rule.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={rule.is_mandatory ? 'default' : 'secondary'}>
                    {rule.is_mandatory ? 'Obrigatória' : 'Opcional'}
                  </Badge>
                  <div>
                    <p className="font-medium">{rule.rule_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ruleTypes.find(t => t.value === rule.rule_type)?.label} {' '}
                      {operators.find(o => o.value === rule.operator)?.label.toLowerCase()} {' '}
                      <span className="font-mono">{rule.value}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Peso: {rule.weight}</Badge>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!rules || rules.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma regra definida</p>
              <p className="text-sm">Adicione regras para definir a elegibilidade</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {programId ? 'Editar Programa' : 'Novo Programa de Incentivo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PROG-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Programa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do programa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os objetivos do programa..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="program_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Programa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="subsidy">Subsídio</SelectItem>
                        <SelectItem value="credit">Crédito</SelectItem>
                        <SelectItem value="tax_benefit">Benefício Fiscal</SelectItem>
                        <SelectItem value="technical_support">Apoio Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agriculture">Agricultura</SelectItem>
                        <SelectItem value="forestry">Florestal</SelectItem>
                        <SelectItem value="coffee">Café</SelectItem>
                        <SelectItem value="rice">Arroz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="budget_aoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orçamento (AOA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Fim</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_beneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta de Beneficiários</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Número de beneficiários pretendidos"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createProgram.isPending || updateProgram.isPending}
              >
                {programId ? 'Guardar Alterações' : 'Criar Programa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
