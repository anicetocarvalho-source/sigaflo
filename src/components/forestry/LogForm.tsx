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
import { useCreateLog, useForestLicenses, useForestTrees, type ForestLog } from '@/hooks/useForestry';
import { Logs, Save, Loader2 } from 'lucide-react';

const logSchema = z.object({
  license_id: z.string().min(1, 'Licença é obrigatória'),
  tree_id: z.string().optional(),
  log_code: z.string().min(1, 'Código da tora é obrigatório'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  wood_class: z.enum(['precious', 'first_class', 'second_class', 'common']),
  length_m: z.coerce.number().min(0, 'Comprimento deve ser positivo').optional(),
  diameter_cm: z.coerce.number().min(0, 'Diâmetro deve ser positivo').optional(),
  volume_m3: z.coerce.number().min(0.01, 'Volume é obrigatório'),
  current_location_name: z.string().optional(),
  destination_name: z.string().optional(),
  notes: z.string().optional(),
});

type LogFormData = z.infer<typeof logSchema>;

interface LogFormProps {
  open: boolean;
  onClose: () => void;
  log?: ForestLog | null;
  preselectedLicenseId?: string;
}

const woodClassLabels: Record<string, string> = {
  precious: 'Madeira Preciosa',
  first_class: '1ª Classe',
  second_class: '2ª Classe',
  common: 'Comum',
};

export function LogForm({ open, onClose, log, preselectedLicenseId }: LogFormProps) {
  const [selectedLicenseId, setSelectedLicenseId] = useState(preselectedLicenseId || '');
  
  const { data: licenses = [] } = useForestLicenses({ status: 'active' });
  const { data: trees = [] } = useForestTrees(selectedLicenseId || undefined);
  const createLog = useCreateLog();

  const form = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      license_id: preselectedLicenseId || '',
      tree_id: '',
      log_code: '',
      species: '',
      wood_class: 'second_class',
      length_m: undefined,
      diameter_cm: undefined,
      volume_m3: 0,
      current_location_name: '',
      destination_name: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (log) {
      form.reset({
        license_id: log.license_id,
        tree_id: log.tree_id ?? '',
        log_code: log.log_code,
        species: log.species,
        wood_class: log.wood_class,
        length_m: log.length_m ?? undefined,
        diameter_cm: log.diameter_cm ?? undefined,
        volume_m3: log.volume_m3,
        current_location_name: log.current_location_name ?? '',
        destination_name: log.destination_name ?? '',
        notes: log.notes ?? '',
      });
      setSelectedLicenseId(log.license_id);
    } else if (preselectedLicenseId) {
      form.setValue('license_id', preselectedLicenseId);
      setSelectedLicenseId(preselectedLicenseId);
    }
  }, [log, preselectedLicenseId, form]);

  const handleLicenseChange = (licenseId: string) => {
    form.setValue('license_id', licenseId);
    form.setValue('tree_id', '');
    setSelectedLicenseId(licenseId);
  };

  const handleTreeChange = (treeId: string) => {
    form.setValue('tree_id', treeId);
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
      form.setValue('species', tree.species);
      form.setValue('wood_class', tree.wood_class as 'precious' | 'first_class' | 'second_class' | 'common');
    }
  };

  const generateLogCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    form.setValue('log_code', `TOR-${timestamp}-${random}`);
  };

  const calculateVolume = () => {
    const length = form.getValues('length_m');
    const diameter = form.getValues('diameter_cm');
    if (length && diameter) {
      // Fórmula de Huber para volume de toras
      const radius = diameter / 200; // Convert cm to m and get radius
      const volume = Math.PI * radius * radius * length;
      form.setValue('volume_m3', Math.round(volume * 1000) / 1000);
    }
  };

  const onSubmit = async (data: LogFormData) => {
    await createLog.mutateAsync({
      license_id: data.license_id,
      log_code: data.log_code,
      species: data.species,
      wood_class: data.wood_class,
      volume_m3: data.volume_m3,
      length_m: data.length_m ?? null,
      diameter_cm: data.diameter_cm ?? null,
      tree_id: data.tree_id || null,
      current_location_name: data.current_location_name || null,
      destination_name: data.destination_name || null,
      notes: data.notes || null,
      status: 'at_origin',
    });
    
    form.reset();
    onClose();
  };

  const logCode = form.watch('log_code');
  const species = form.watch('species');
  const volume = form.watch('volume_m3');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Logs className="h-5 w-5" />
            {log ? 'Editar Tora' : 'Registar Nova Tora'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="license_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licença *</FormLabel>
                    <Select onValueChange={handleLicenseChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar licença" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {licenses.map((license) => (
                          <SelectItem key={license.id} value={license.id}>
                            {license.license_number} - {license.forest_operators?.name}
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
                name="tree_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Árvore de Origem</FormLabel>
                    <Select onValueChange={handleTreeChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vincular a árvore (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trees.filter(t => t.status === 'felled' || t.status === 'logged').map((tree) => (
                          <SelectItem key={tree.id} value={tree.id}>
                            {tree.tree_code} - {tree.species}
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
                name="log_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código da Tora *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="TOR-XXXX-XXXX" />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={generateLogCode}>
                        #
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espécie *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Espécie da madeira" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wood_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe da Madeira *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(woodClassLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="length_m"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprimento (m)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onBlur={() => calculateVolume()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diameter_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diâmetro Médio (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        {...field}
                        onBlur={() => calculateVolume()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume_m3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (m³) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_location_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização Actual</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Parque de madeiras" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Serraria ABC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            {logCode && species && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'log',
                    code: logCode,
                    species: species,
                    volume: volume,
                  })}
                  size={80}
                  level="M"
                />
                <div>
                  <p className="font-medium">QR Code da Tora</p>
                  <p className="text-sm text-muted-foreground">
                    {logCode} • {species} • {volume} m³
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLog.isPending}>
                {createLog.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Tora
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
