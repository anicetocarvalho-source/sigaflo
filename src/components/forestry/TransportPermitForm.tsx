import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
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
import { useCreateTransportPermit, useForestLicenses, useForestOperators, useForestLogs, type ForestTransportPermit } from '@/hooks/useForestry';
import { useProvinces } from '@/hooks/useFarmers';
import { Truck, Save, Loader2, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

const transportSchema = z.object({
  license_id: z.string().min(1, 'Licença é obrigatória'),
  operator_id: z.string().min(1, 'Operador é obrigatório'),
  permit_number: z.string().min(1, 'Número da guia é obrigatório'),
  driver_name: z.string().min(1, 'Nome do motorista é obrigatório'),
  driver_document: z.string().optional(),
  driver_phone: z.string().optional(),
  vehicle_plate: z.string().min(1, 'Matrícula é obrigatória'),
  origin_location: z.string().min(1, 'Local de origem é obrigatório'),
  origin_province_id: z.string().optional(),
  destination_location: z.string().min(1, 'Local de destino é obrigatório'),
  destination_province_id: z.string().optional(),
  issue_date: z.string().min(1, 'Data de emissão é obrigatória'),
  valid_until: z.string().min(1, 'Data de validade é obrigatória'),
  total_logs: z.coerce.number().optional(),
  total_volume_m3: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type TransportFormData = z.infer<typeof transportSchema>;

interface TransportPermitFormProps {
  open: boolean;
  onClose: () => void;
  permit?: ForestTransportPermit | null;
}

export function TransportPermitForm({ open, onClose, permit }: TransportPermitFormProps) {
  const [selectedLicenseId, setSelectedLicenseId] = useState('');

  const { data: licenses = [] } = useForestLicenses({ status: 'active' });
  const { data: operators = [] } = useForestOperators();
  const { data: provinces = [] } = useProvinces();
  const { data: logs = [] } = useForestLogs(selectedLicenseId || undefined);
  const createPermit = useCreateTransportPermit();

  const availableLogs = logs.filter(log => log.status === 'at_origin');
  const totalAvailableVolume = availableLogs.reduce((sum, log) => sum + log.volume_m3, 0);

  const form = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      license_id: '',
      operator_id: '',
      permit_number: '',
      driver_name: '',
      driver_document: '',
      driver_phone: '',
      vehicle_plate: '',
      origin_location: '',
      origin_province_id: '',
      destination_location: '',
      destination_province_id: '',
      issue_date: format(new Date(), 'yyyy-MM-dd'),
      valid_until: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      total_logs: undefined,
      total_volume_m3: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (permit) {
      form.reset({
        license_id: permit.license_id,
        operator_id: permit.operator_id,
        permit_number: permit.permit_number,
        driver_name: permit.driver_name,
        driver_document: permit.driver_document ?? '',
        driver_phone: permit.driver_phone ?? '',
        vehicle_plate: permit.vehicle_plate,
        origin_location: permit.origin_location,
        origin_province_id: permit.origin_province_id ?? '',
        destination_location: permit.destination_location,
        destination_province_id: permit.destination_province_id ?? '',
        issue_date: permit.issue_date,
        valid_until: permit.valid_until,
        total_logs: permit.total_logs ?? undefined,
        total_volume_m3: permit.total_volume_m3 ?? undefined,
        notes: permit.notes ?? '',
      });
      setSelectedLicenseId(permit.license_id);
    }
  }, [permit, form]);

  const handleLicenseChange = (licenseId: string) => {
    form.setValue('license_id', licenseId);
    setSelectedLicenseId(licenseId);
    
    const license = licenses.find(l => l.id === licenseId);
    if (license) {
      form.setValue('operator_id', license.operator_id);
    }
  };

  const generatePermitNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    form.setValue('permit_number', `GT-${year}-${random}`);
  };

  const fillFromAvailableLogs = () => {
    form.setValue('total_logs', availableLogs.length);
    form.setValue('total_volume_m3', Math.round(totalAvailableVolume * 1000) / 1000);
  };

  const onSubmit = async (data: TransportFormData) => {
    await createPermit.mutateAsync({
      license_id: data.license_id,
      operator_id: data.operator_id,
      permit_number: data.permit_number,
      driver_name: data.driver_name,
      driver_document: data.driver_document || null,
      driver_phone: data.driver_phone || null,
      vehicle_plate: data.vehicle_plate,
      origin_location: data.origin_location,
      origin_province_id: data.origin_province_id || null,
      destination_location: data.destination_location,
      destination_province_id: data.destination_province_id || null,
      issue_date: data.issue_date,
      valid_until: data.valid_until,
      total_logs: data.total_logs ?? null,
      total_volume_m3: data.total_volume_m3 ?? null,
      notes: data.notes || null,
      status: 'active',
    });
    
    form.reset();
    onClose();
  };

  const permitNumber = form.watch('permit_number');
  const vehiclePlate = form.watch('vehicle_plate');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {permit ? 'Editar Guia de Transporte' : 'Nova Guia de Transporte'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Licença e Operador */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Licença e Operador
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="license_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Licença Florestal *</FormLabel>
                      <Select onValueChange={handleLicenseChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar licença" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {licenses.map((license) => (
                            <SelectItem key={license.id} value={license.id}>
                              {license.license_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operator_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operador *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar operador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.id} value={op.id}>
                              {op.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permit_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Guia *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} placeholder="GT-XXXX-XXXX" />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={generatePermitNumber}>
                          #
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Motorista e Veículo */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Motorista e Veículo
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="driver_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Motorista *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver_document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BI/Documento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nº documento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+244..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="LD-00-00-AA" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Origem e Destino */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Trajecto
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="origin_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local de Origem *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Parque de madeiras, concessão..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="origin_province_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província de Origem</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar província" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map((prov) => (
                              <SelectItem key={prov.id} value={prov.id}>
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="destination_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local de Destino *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Serraria, porto, armazém..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination_province_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província de Destino</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar província" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map((prov) => (
                              <SelectItem key={prov.id} value={prov.id}>
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Datas e Carga */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Validade e Carga
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válida Até *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_logs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Toras</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_volume_m3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume Total (m³)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedLicenseId && availableLogs.length > 0 && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Toras disponíveis para transporte</p>
                    <p className="text-sm text-muted-foreground">
                      {availableLogs.length} toras • {totalAvailableVolume.toFixed(3)} m³
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={fillFromAvailableLogs}>
                    Usar todas
                  </Button>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Notas adicionais..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* QR Code Preview */}
            {permitNumber && vehiclePlate && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'transport',
                    permit: permitNumber,
                    vehicle: vehiclePlate,
                  })}
                  size={80}
                  level="M"
                />
                <div>
                  <p className="font-medium">QR Code da Guia</p>
                  <p className="text-sm text-muted-foreground">
                    {permitNumber} • {vehiclePlate}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPermit.isPending}>
                {createPermit.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Emitir Guia
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
