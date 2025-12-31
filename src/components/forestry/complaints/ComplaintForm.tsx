import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  complaint_type: z.string().min(1, 'Tipo de denúncia é obrigatório'),
  is_anonymous: z.boolean().default(false),
  complainant_name: z.string().optional(),
  complainant_phone: z.string().optional(),
  complainant_email: z.string().email().optional().or(z.literal('')),
  province_id: z.string().min(1, 'Província é obrigatória'),
  municipality_id: z.string().optional(),
  location_description: z.string().min(5, 'Descrição do local é obrigatória'),
  occurrence_date: z.string().optional(),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ComplaintFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

const complaintTypes = [
  { value: 'illegal_logging', label: 'Corte Ilegal de Árvores' },
  { value: 'illegal_transport', label: 'Transporte Ilegal de Madeira' },
  { value: 'deforestation', label: 'Desmatamento' },
  { value: 'poaching', label: 'Caça Furtiva' },
  { value: 'fire', label: 'Queimada Ilegal' },
  { value: 'encroachment', label: 'Invasão de Área Protegida' },
  { value: 'pollution', label: 'Poluição/Contaminação' },
  { value: 'other', label: 'Outra Irregularidade' },
];

export function ComplaintForm({ open, onClose, onSubmit }: ComplaintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      complaint_type: '',
      is_anonymous: false,
      complainant_name: '',
      complainant_phone: '',
      complainant_email: '',
      province_id: '',
      municipality_id: '',
      location_description: '',
      occurrence_date: '',
      description: '',
    },
  });

  const isAnonymous = form.watch('is_anonymous');
  const provinceId = form.watch('province_id');
  const locationCascade = useLocationCascade();
  const { provinces, municipalities } = locationCascade;

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Submeter Denúncia
          </DialogTitle>
          <DialogDescription>
            Denuncie irregularidades florestais. A sua identidade pode ser protegida.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-primary/5 border-primary/20">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            As denúncias são tratadas com confidencialidade. Pode optar por submeter anonimamente.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Anonymous Option */}
            <FormField
              control={form.control}
              name="is_anonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Denúncia Anónima</FormLabel>
                    <FormDescription>
                      Marque se não deseja identificar-se. Não poderemos dar feedback sobre o progresso.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Complainant Info (if not anonymous) */}
            {!isAnonymous && (
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Dados do Denunciante (opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="complainant_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Seu nome" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complainant_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+244 9XX XXX XXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complainant_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Complaint Type */}
            <FormField
              control={form.control}
              name="complaint_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Irregularidade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione o tipo de irregularidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {complaintTypes.map(type => (
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

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Província *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione a província" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces?.map(prov => (
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

              <FormField
                control={form.control}
                name="municipality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!provinceId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione o município" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {municipalities?.map(mun => (
                          <SelectItem key={mun.id} value={mun.id}>
                            {mun.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Local *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o local com o máximo de detalhes (estrada, aldeia, pontos de referência...)"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="occurrence_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Ocorrência</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} placeholder="-12.34" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} placeholder="13.56" />
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
                  <FormLabel>Descrição da Irregularidade *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva o que observou com o máximo de detalhes possível. Inclua informações sobre veículos, pessoas envolvidas, horários, etc."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submeter Denúncia
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
