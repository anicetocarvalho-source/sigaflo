import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Landmark, 
  Plus, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useAlternativeGuarantees, useCreateGuarantee } from '@/hooks/useCreditInsurance';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AlternativeGuarantees() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    farmer_id: '',
    guarantee_type: '' as any,
    description: '',
    estimated_value_aoa: '',
    document_reference: '',
    valid_from: '',
    valid_until: ''
  });

  const { data: farmers } = useFarmers();
  const { data: guarantees, isLoading, refetch } = useAlternativeGuarantees();
  const createGuarantee = useCreateGuarantee();

  const handleSubmit = async () => {
    if (!formData.farmer_id || !formData.guarantee_type || !formData.description) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await createGuarantee.mutateAsync({
        farmer_id: formData.farmer_id,
        guarantee_type: formData.guarantee_type,
        description: formData.description,
        estimated_value_aoa: parseFloat(formData.estimated_value_aoa) || 0,
        document_reference: formData.document_reference || null,
        document_url: null,
        verification_status: 'pending',
        score_impact_points: calculateScoreImpact(formData.guarantee_type, parseFloat(formData.estimated_value_aoa) || 0),
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        is_active: true,
        created_by: null
      });
      toast.success('Garantia registada com sucesso');
      setIsDialogOpen(false);
      setFormData({
        farmer_id: '',
        guarantee_type: '',
        description: '',
        estimated_value_aoa: '',
        document_reference: '',
        valid_from: '',
        valid_until: ''
      });
      refetch();
    } catch (e) {
      toast.error('Erro ao registar garantia');
    }
  };

  const calculateScoreImpact = (type: string, value: number) => {
    const baseImpact: Record<string, number> = {
      'sigaf_certificate': 10,
      'subsidy_history': 8,
      'supply_contract': 12,
      'future_production': 5,
      'equipment': 7,
      'other': 3
    };
    const base = baseImpact[type] || 3;
    // Add value bonus (1 point per 1M AOA up to 5 extra points)
    const valueBonus = Math.min(5, Math.floor(value / 1000000));
    return base + valueBonus;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { color: string; label: string }> = {
      'future_production': { color: 'bg-green-100 text-green-800', label: 'Produção Futura' },
      'supply_contract': { color: 'bg-blue-100 text-blue-800', label: 'Contrato Fornecimento' },
      'sigaf_certificate': { color: 'bg-purple-100 text-purple-800', label: 'Certificado SIGAF' },
      'subsidy_history': { color: 'bg-yellow-100 text-yellow-800', label: 'Histórico Subsídios' },
      'equipment': { color: 'bg-orange-100 text-orange-800', label: 'Equipamento' },
      'other': { color: 'bg-gray-100 text-gray-800', label: 'Outro' },
    };
    const config = types[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verificado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalValue = guarantees?.reduce((sum, g) => sum + (g.estimated_value_aoa || 0), 0) || 0;
  const totalScoreImpact = guarantees?.reduce((sum, g) => sum + (g.score_impact_points || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Garantias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guarantees?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Garantias registadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valor Estimado Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Em garantias alternativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Impacto no Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalScoreImpact} pts</div>
            <p className="text-xs text-muted-foreground">Potencial de melhoria</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Guarantee */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Garantias Não-Convencionais</CardTitle>
              <CardDescription>
                Registe garantias alternativas como produção futura, contratos ou certificados
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Garantia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registar Garantia Alternativa</DialogTitle>
                  <DialogDescription>
                    Adicione uma garantia não-convencional para melhorar o score de crédito
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Agricultor *</Label>
                    <Select 
                      value={formData.farmer_id} 
                      onValueChange={(v) => setFormData({...formData, farmer_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers?.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Garantia *</Label>
                    <Select 
                      value={formData.guarantee_type} 
                      onValueChange={(v) => setFormData({...formData, guarantee_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="future_production">Produção Futura Estimada</SelectItem>
                        <SelectItem value="supply_contract">Contrato de Fornecimento</SelectItem>
                        <SelectItem value="sigaf_certificate">Certificado SIGAF</SelectItem>
                        <SelectItem value="subsidy_history">Histórico de Subsídios</SelectItem>
                        <SelectItem value="equipment">Equipamento</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva a garantia..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Estimado (AOA)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_value_aoa}
                      onChange={(e) => setFormData({...formData, estimated_value_aoa: e.target.value})}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Referência do Documento</Label>
                    <Input
                      value={formData.document_reference}
                      onChange={(e) => setFormData({...formData, document_reference: e.target.value})}
                      placeholder="Número do contrato, certificado, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Válido Desde</Label>
                      <Input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Válido Até</Label>
                      <Input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      />
                    </div>
                  </div>

                  {formData.guarantee_type && formData.estimated_value_aoa && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Impacto estimado: +{calculateScoreImpact(formData.guarantee_type, parseFloat(formData.estimated_value_aoa) || 0)} pontos no score
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={createGuarantee.isPending}>
                      Registar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead>Impacto Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : guarantees?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Landmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma garantia registada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  guarantees?.map((guarantee) => (
                    <TableRow key={guarantee.id}>
                      <TableCell>{getTypeBadge(guarantee.guarantee_type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{guarantee.description}</TableCell>
                      <TableCell>{formatCurrency(guarantee.estimated_value_aoa)}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">+{guarantee.score_impact_points} pts</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(guarantee.verification_status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {guarantee.valid_until 
                          ? new Date(guarantee.valid_until).toLocaleDateString('pt-AO')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
