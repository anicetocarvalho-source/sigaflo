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
import { useCreateTree, useForestLicenses, type ForestTree } from '@/hooks/useForestry';
import { MapPin, TreePine, Save, Loader2 } from 'lucide-react';

const treeSchema = z.object({
  license_id: z.string().min(1, 'Licença é obrigatória'),
  tree_code: z.string().min(1, 'Código da árvore é obrigatório'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  wood_class: z.enum(['precious', 'first_class', 'second_class', 'common']),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  diameter_cm: z.coerce
    .number({ invalid_type_error: 'Diâmetro inválido' })
    .min(5, 'Diâmetro mínimo é 5 cm (DAP)')
    .max(400, 'Diâmetro máximo é 400 cm. Confirme a unidade (cm)')
    .optional(),
  height_m: z.coerce
    .number({ invalid_type_error: 'Altura inválida' })
    .min(1, 'Altura mínima é 1 m')
    .max(80, 'Altura máxima é 80 m. Confirme a unidade (metros)')
    .optional(),
  estimated_volume_m3: z.coerce
    .number({ invalid_type_error: 'Volume inválido' })
    .min(0, 'Volume deve ser positivo')
    .max(100, 'Volume máximo é 100 m³ por árvore')
    .optional(),
  plot_number: z.string().optional(),
  health_status: z.string().optional(),
  notes: z.string().optional(),
});

type TreeFormData = z.infer<typeof treeSchema>;

interface TreeFormProps {
  open: boolean;
  onClose: () => void;
  tree?: ForestTree | null;
  preselectedLicenseId?: string;
}

const woodClassLabels: Record<string, string> = {
  precious: 'Madeira Preciosa',
  first_class: '1ª Classe',
  second_class: '2ª Classe',
  common: 'Comum',
};

const speciesOptions = [
  'Girassonde / Mukwa (Pterocarpus angolensis)',
  'Mussivi (Guibourtia coleosperma)',
  'Chanfuta (Afzelia quanzensis)',
  'Miombo (Brachystegia spiciformis)',
  'Miombo / Mutondo (Julbernardia paniculata)',
  'Isoberlinia (Isoberlinia angolensis)',
  'Pau-preto / Ébano africano (Diospyros mespiliformis)',
  'Pau-sangue (Pterocarpus tinctorius)',
  'Sapele / Mogno africano (Entandrophragma cylindricum)',
  'Sipo / Mogno africano (Entandrophragma utile)',
  'Tiama / Mogno africano (Entandrophragma angolense)',
  'Kosipo (Entandrophragma candollei)',
  'Mogno africano (Khaya anthotheca)',
  'Mogno africano (Khaya ivorensis)',
  'Limba / Fraké (Terminalia superba)',
  'Iroko (Milicia excelsa)',
  'Tchitola (Oxystigma oxyphyllum)',
  'Agba (Gossweilerodendron balsamiferum)',
  'Eucalipto (Eucalyptus spp.)',
  'Pinheiro (Pinus spp.)',
  'Outro',
];

export function TreeForm({ open, onClose, tree, preselectedLicenseId }: TreeFormProps) {
  const [gettingLocation, setGettingLocation] = useState(false);
  const { data: licenses = [] } = useForestLicenses({ status: 'active' });
  const createTree = useCreateTree();

  const form = useForm<TreeFormData>({
    resolver: zodResolver(treeSchema),
    defaultValues: {
      license_id: preselectedLicenseId || '',
      tree_code: '',
      species: '',
      wood_class: 'second_class',
      latitude: 0,
      longitude: 0,
      diameter_cm: undefined,
      height_m: undefined,
      estimated_volume_m3: undefined,
      plot_number: '',
      health_status: 'bom',
      notes: '',
    },
  });

  useEffect(() => {
    if (tree) {
      form.reset({
        license_id: tree.license_id,
        tree_code: tree.tree_code,
        species: tree.species,
        wood_class: tree.wood_class,
        latitude: tree.latitude,
        longitude: tree.longitude,
        diameter_cm: tree.diameter_cm ?? undefined,
        height_m: tree.height_m ?? undefined,
        estimated_volume_m3: tree.estimated_volume_m3 ?? undefined,
        plot_number: tree.plot_number ?? '',
        health_status: tree.health_status ?? 'bom',
        notes: tree.notes ?? '',
      });
    } else if (preselectedLicenseId) {
      form.setValue('license_id', preselectedLicenseId);
    }
  }, [tree, preselectedLicenseId, form]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue('latitude', position.coords.latitude);
        form.setValue('longitude', position.coords.longitude);
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const generateTreeCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    form.setValue('tree_code', `ARV-${timestamp}-${random}`);
  };

  const onSubmit = async (data: TreeFormData) => {
    const qrCodeData = JSON.stringify({
      type: 'tree',
      code: data.tree_code,
      species: data.species,
      lat: data.latitude,
      lng: data.longitude,
      class: data.wood_class,
    });

    await createTree.mutateAsync({
      license_id: data.license_id,
      tree_code: data.tree_code,
      species: data.species,
      wood_class: data.wood_class,
      latitude: data.latitude,
      longitude: data.longitude,
      diameter_cm: data.diameter_cm ?? null,
      height_m: data.height_m ?? null,
      estimated_volume_m3: data.estimated_volume_m3 ?? null,
      plot_number: data.plot_number || null,
      health_status: data.health_status || null,
      notes: data.notes || null,
      status: 'logged',
    });
    
    form.reset();
    onClose();
  };

  const treeCode = form.watch('tree_code');
  const species = form.watch('species');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            {tree ? 'Editar Árvore' : 'Registar Nova Árvore'}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="tree_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código da Árvore *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="ARV-XXXX-XXXX" />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={generateTreeCode}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar espécie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {speciesOptions.map((sp) => (
                          <SelectItem key={sp} value={sp}>
                            {sp}
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
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                      >
                        {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
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
                    <FormLabel>Diâmetro DAP (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min={5} max={400} placeholder="Ex: 45.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height_m"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (m)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min={1} max={80} placeholder="Ex: 18.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_volume_m3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume Estimado (m³)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} max={100} placeholder="Ex: 2.35" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plot_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº Parcela</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="P001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Saúde</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excelente">Excelente</SelectItem>
                        <SelectItem value="bom">Bom</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="danificado">Danificado</SelectItem>
                        <SelectItem value="morto">Morto</SelectItem>
                      </SelectContent>
                    </Select>
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
            {treeCode && species && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'tree',
                    code: treeCode,
                    species: species,
                  })}
                  size={80}
                  level="M"
                />
                <div>
                  <p className="font-medium">QR Code da Árvore</p>
                  <p className="text-sm text-muted-foreground">
                    {treeCode} • {species}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTree.isPending}>
                {createTree.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Árvore
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
