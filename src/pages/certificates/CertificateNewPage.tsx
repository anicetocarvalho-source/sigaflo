import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useFarmers, useFarmer } from '@/hooks/useFarmers';
import { useCreateCertificate } from '@/hooks/useCertificates';

const certificateSchema = z.object({
  farmer_id: z.string().uuid('Selecione um agricultor'),
  certificate_type: z.enum(['production', 'organic', 'quality', 'origin', 'good_practices']),
  crops: z.array(z.string()).min(1, 'Selecione pelo menos uma cultura'),
  season: z.string().min(1, 'Informe a campanha'),
  year: z.number().min(2020).max(2030),
  total_area_ha: z.number().min(0).optional(),
  total_quantity_kg: z.number().min(0).optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

const cropOptions = [
  'Milho', 'Feijão', 'Mandioca', 'Batata-doce', 'Arroz', 
  'Soja', 'Girassol', 'Amendoim', 'Hortícolas', 'Frutas',
  'Café', 'Banana', 'Cana-de-açúcar', 'Algodão', 'Outros'
];

const certificateTypes = [
  { value: 'production', label: 'Certificado de Produção' },
  { value: 'organic', label: 'Certificado Orgânico' },
  { value: 'quality', label: 'Certificado de Qualidade' },
  { value: 'origin', label: 'Certificado de Origem' },
  { value: 'good_practices', label: 'Boas Práticas Agrícolas' },
];

const CertificateNewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedFarmerId = searchParams.get('farmer_id');
  
  const { data: farmers } = useFarmers();
  const { data: preselectedFarmer } = useFarmer(preselectedFarmerId || '');
  const createCertificate = useCreateCertificate();
  
  const currentYear = new Date().getFullYear();

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      farmer_id: preselectedFarmerId || undefined,
      certificate_type: 'production',
      crops: [],
      season: 'Principal',
      year: currentYear,
      total_area_ha: undefined,
      total_quantity_kg: undefined,
    },
  });

  const handleSubmit = async (data: CertificateFormData) => {
    await createCertificate.mutateAsync(data);
    navigate('/certificados');
  };

  return (
    <MainLayout title="Novo Certificado" subtitle="Emitir certificado de produção agrícola">
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Certificado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="farmer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agricultor / Entidade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o agricultor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {preselectedFarmer && (
                            <SelectItem value={preselectedFarmer.id}>
                              {preselectedFarmer.name} ({preselectedFarmer.registration_number})
                            </SelectItem>
                          )}
                          {farmers?.filter(f => f.id !== preselectedFarmerId).map((farmer) => (
                            <SelectItem key={farmer.id} value={farmer.id}>
                              {farmer.name} ({farmer.registration_number})
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
                  name="certificate_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Certificado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {certificateTypes.map((type) => (
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

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campanha *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a campanha" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Principal">Campanha Principal</SelectItem>
                            <SelectItem value="Secundária">Campanha Secundária</SelectItem>
                            <SelectItem value="Irrigada">Campanha Irrigada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano *</FormLabel>
                        <Select 
                          onValueChange={(v) => field.onChange(parseInt(v))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
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
                  name="crops"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Culturas *</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {cropOptions.map((crop) => (
                          <Button
                            key={crop}
                            type="button"
                            variant={field.value?.includes(crop) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const current = field.value || [];
                              if (current.includes(crop)) {
                                field.onChange(current.filter((c) => c !== crop));
                              } else {
                                field.onChange([...current, crop]);
                              }
                            }}
                          >
                            {crop}
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="total_area_ha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Total (ha)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total_quantity_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade Total (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Link to="/certificados">
                <Button type="button" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Button type="submit" disabled={createCertificate.isPending}>
                {createCertificate.isPending ? 'A criar...' : 'Criar Certificado'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default CertificateNewPage;
