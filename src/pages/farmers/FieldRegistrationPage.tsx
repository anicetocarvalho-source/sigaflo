import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Wifi, WifiOff, ChevronRight, ChevronLeft, Check, Clock } from 'lucide-react';
import { useCreateFarmer, useProvinces, useMunicipalities, useCommunes } from '@/hooks/useFarmers';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  'Tipo de Registo',
  'Dados Pessoais',
  'Localização',
  'Parcelas',
  'Biometria',
  'Documentos',
  'Revisão',
];

const FieldRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isOnline] = useState(navigator.onLine);
  const [startTime] = useState(Date.now());
  const [formData, setFormData] = useState({
    farmer_type: 'individual' as string,
    name: '',
    bi_nif: '',
    phone: '',
    province_id: '',
    municipality_id: '',
    commune_id: '',
    village: '',
    total_area_ha: '',
    main_crops: [] as string[],
  });

  const { data: provinces } = useProvinces();
  const { data: municipalities } = useMunicipalities(formData.province_id);
  const { data: communes } = useCommunes(formData.municipality_id);
  const createFarmer = useCreateFarmer();

  const progress = ((step + 1) / STEPS.length) * 100;
  const elapsed = Math.floor((Date.now() - startTime) / 60000);

  const handleSubmit = () => {
    createFarmer.mutate({
      farmer_type: formData.farmer_type as any,
      name: formData.name,
      bi_nif: formData.bi_nif || undefined,
      phone: formData.phone || undefined,
      province_id: formData.province_id || undefined,
      municipality_id: formData.municipality_id || undefined,
      commune_id: formData.commune_id || undefined,
      village: formData.village || undefined,
      total_area_ha: formData.total_area_ha ? parseFloat(formData.total_area_ha) : undefined,
      main_crops: formData.main_crops.length ? formData.main_crops : undefined,
      status: 'draft',
      is_active: true,
    }, {
      onSuccess: () => {
        toast.success('Agricultor registado com sucesso!');
        navigate('/agricultores');
      },
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Cadastro de Campo" subtitle="Registo mobile-first de agricultores">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Status bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            {isOnline ? (
              <Badge variant="default" className="bg-green-100 text-green-700"><Wifi className="mr-1 h-3 w-3" />Online</Badge>
            ) : (
              <Badge variant="secondary"><WifiOff className="mr-1 h-3 w-3" />Offline</Badge>
            )}
          </div>
          <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{elapsed} min</Badge>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Passo {step + 1} de {STEPS.length}: {STEPS[step]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="pt-6">
            {step === 0 && (
              <div className="space-y-4">
                <Label>Tipo de Agricultor</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'individual', label: 'Individual' },
                    { value: 'family', label: 'Agregado Familiar' },
                    { value: 'cooperative', label: 'Cooperativa' },
                    { value: 'company', label: 'Empresa' },
                  ].map(t => (
                    <Button
                      key={t.value}
                      variant={formData.farmer_type === t.value ? 'default' : 'outline'}
                      className="h-16"
                      onClick={() => updateField('farmer_type', t.value)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div><Label>Nome Completo *</Label><Input value={formData.name} onChange={e => updateField('name', e.target.value)} /></div>
                <div><Label>BI / NIF</Label><Input value={formData.bi_nif} onChange={e => updateField('bi_nif', e.target.value)} /></div>
                <div><Label>Telefone</Label><Input value={formData.phone} onChange={e => updateField('phone', e.target.value)} /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Província</Label>
                  <Select value={formData.province_id} onValueChange={v => { updateField('province_id', v); updateField('municipality_id', ''); updateField('commune_id', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{provinces?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Município</Label>
                  <Select value={formData.municipality_id} onValueChange={v => { updateField('municipality_id', v); updateField('commune_id', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{municipalities?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Comuna</Label>
                  <Select value={formData.commune_id} onValueChange={v => updateField('commune_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{communes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Aldeia</Label><Input value={formData.village} onChange={e => updateField('village', e.target.value)} /></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div><Label>Área Total (ha)</Label><Input type="number" step="0.1" value={formData.total_area_ha} onChange={e => updateField('total_area_ha', e.target.value)} /></div>
                <p className="text-sm text-muted-foreground">As parcelas detalhadas podem ser adicionadas no perfil após o registo.</p>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Funcionalidade de captura biométrica requer dispositivo compatível.</p>
                <p className="text-sm text-muted-foreground mt-2">Pode ser completada posteriormente no perfil do agricultor.</p>
              </div>
            )}

            {step === 5 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Documentos (BI, fotos) podem ser carregados no perfil após o registo.</p>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Resumo do Registo</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tipo:</span><span>{formData.farmer_type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Nome:</span><span className="font-medium">{formData.name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">BI/NIF:</span><span>{formData.bi_nif || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telefone:</span><span>{formData.phone || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Área:</span><span>{formData.total_area_ha ? `${formData.total_area_ha} ha` : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tempo:</span><span>{elapsed} min</span></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />Anterior
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Seguinte<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!formData.name || createFarmer.isPending}>
              <Check className="mr-1 h-4 w-4" />{createFarmer.isPending ? 'Guardando...' : 'Concluir Registo'}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FieldRegistrationPage;
