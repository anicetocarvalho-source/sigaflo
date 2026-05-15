import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateImportLicense, useUpdateImportLicense, type ForestImportLicense } from '@/hooks/useForestImportLicenses';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import type { TablesInsert } from '@/integrations/supabase/types';

interface Props {
  open: boolean;
  onClose: () => void;
  license?: ForestImportLicense | null;
}

type FormValues = TablesInsert<'forest_import_licenses'>;

const personTypes = [
  { value: 'singular', label: 'Pessoa Singular' },
  { value: 'colectiva', label: 'Pessoa Colectiva' },
];

const categories = [
  { value: 'madeira', label: 'Madeira e derivados' },
  { value: 'sementes', label: 'Sementes' },
  { value: 'mudas', label: 'Mudas / Plantas' },
  { value: 'fertilizantes', label: 'Fertilizantes' },
  { value: 'pesticidas', label: 'Pesticidas / Fitofármacos' },
  { value: 'equipamento', label: 'Equipamento agroflorestal' },
  { value: 'racao', label: 'Ração / Alimentos animais' },
  { value: 'outro', label: 'Outro' },
];

const statuses = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'submitted', label: 'Submetida' },
  { value: 'under_review', label: 'Em Análise' },
  { value: 'approved', label: 'Aprovada' },
  { value: 'issued', label: 'Emitida' },
  { value: 'rejected', label: 'Rejeitada' },
  { value: 'expired', label: 'Expirada' },
  { value: 'revoked', label: 'Revogada' },
];

export function ImportLicenseForm({ open, onClose, license }: Props) {
  const create = useCreateImportLicense();
  const update = useUpdateImportLicense();
  const { provinces } = useLocationCascade();
  const isEdit = Boolean(license?.id);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      person_type: 'colectiva',
      product_category: 'madeira',
      status: 'draft',
      currency: 'USD',
      unit: 'kg',
      quantity: 0,
    },
  });

  useEffect(() => {
    if (license) {
      reset(license as unknown as FormValues);
    } else {
      reset({
        person_type: 'colectiva',
        product_category: 'madeira',
        status: 'draft',
        currency: 'USD',
        unit: 'kg',
        quantity: 0,
      } as FormValues);
    }
  }, [license, open, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      quantity: Number(values.quantity || 0),
      cif_value: values.cif_value ? Number(values.cif_value) : null,
      province_id: values.province_id || null,
    };
    if (isEdit && license) {
      await update.mutateAsync({ id: license.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  };

  const personType = watch('person_type');
  const provinceId = watch('province_id');
  const productCategory = watch('product_category');
  const status = watch('status');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar' : 'Nova'} Licença de Importação Agroflorestal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Pessoa *</Label>
              <Select value={personType} onValueChange={(v) => setValue('person_type', v as FormValues['person_type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {personTypes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{personType === 'singular' ? 'Nome Completo' : 'Designação Social'} *</Label>
              <Input {...register('importer_name', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{personType === 'singular' ? 'BI / Passaporte' : 'NIF'} *</Label>
              <Input {...register('document_number', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input {...register('phone')} placeholder="+244..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endereço</Label>
              <Input {...register('address')} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
            <div className="space-y-2">
              <Label>País de Origem *</Label>
              <Input {...register('origin_country', { required: true })} placeholder="Ex.: Brasil" />
            </div>
            <div className="space-y-2">
              <Label>Posto / Porto de Entrada</Label>
              <Input {...register('entry_point')} placeholder="Ex.: Porto de Luanda" />
            </div>
            <div className="space-y-2">
              <Label>Província de Destino</Label>
              <Select value={provinceId || ''} onValueChange={(v) => setValue('province_id', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria de Produto *</Label>
              <Select value={productCategory} onValueChange={(v) => setValue('product_category', v as FormValues['product_category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição do Produto *</Label>
              <Textarea {...register('product_description', { required: true })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input type="number" step="0.001" {...register('quantity', { required: true, valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input {...register('unit')} placeholder="kg, m³, un..." />
            </div>
            <div className="space-y-2">
              <Label>Valor CIF</Label>
              <Input type="number" step="0.01" {...register('cif_value', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Moeda</Label>
              <Input {...register('currency')} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
            <div className="space-y-2">
              <Label>Nº Factura Proforma</Label>
              <Input {...register('proforma_invoice_number')} placeholder="Ex.: 20224071" />
            </div>
            <div className="space-y-2">
              <Label>Data Factura Proforma</Label>
              <Input type="date" {...register('proforma_invoice_date')} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 pt-2 border-t">
            <div className="space-y-2">
              <Label>Data de Emissão</Label>
              <Input type="date" {...register('issue_date')} />
            </div>
            <div className="space-y-2">
              <Label>Data de Validade</Label>
              <Input type="date" {...register('expiry_date')} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v as FormValues['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
            <div className="space-y-2">
              <Label>Local de Emissão</Label>
              <Input {...register('issued_location')} placeholder="LUANDA" />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                type="checkbox"
                id="phyto"
                className="h-4 w-4"
                {...register('requires_phytosanitary_cert')}
              />
              <Label htmlFor="phyto" className="cursor-pointer">
                Exige Certificado Fitossanitário da origem
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Base Legal</Label>
            <Input {...register('legal_reference')} />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea {...register('notes')} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEdit ? 'Actualizar' : 'Criar Licença'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
