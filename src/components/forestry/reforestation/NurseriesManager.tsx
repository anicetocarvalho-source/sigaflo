import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Sprout, MapPin, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Nursery {
  id: string;
  name: string;
  location: string;
  province?: string;
  capacity: number;
  current_stock: number;
  species: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

interface NurseriesManagerProps {
  nurseries?: Nursery[];
  isLoading?: boolean;
}

const formSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  location: z.string().min(1, 'Localização é obrigatória'),
  capacity: z.coerce.number().min(100, 'Capacidade mínima de 100'),
  current_stock: z.coerce.number().min(0),
  species: z.string().min(1, 'Espécies são obrigatórias'),
});

export function NurseriesManager({ nurseries = [], isLoading }: NurseriesManagerProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      capacity: 10000,
      current_stock: 0,
      species: '',
    },
  });

  // Dados de exemplo quando não há dados reais
  const displayNurseries: Nursery[] = nurseries.length > 0 ? nurseries : [
    {
      id: '1',
      name: 'Viveiro Central de Cabinda',
      location: 'Cabinda, Cabinda',
      province: 'Cabinda',
      capacity: 50000,
      current_stock: 32500,
      species: ['Eucalipto', 'Acácia', 'Mukwa'],
      status: 'active',
    },
    {
      id: '2',
      name: 'Viveiro Municipal Uíge',
      location: 'Uíge, Uíge',
      province: 'Uíge',
      capacity: 30000,
      current_stock: 18200,
      species: ['Pinheiro', 'Mangueira', 'Cajueiro'],
      status: 'active',
    },
    {
      id: '3',
      name: 'Viveiro Comunitário Zaire',
      location: 'Mbanza Kongo, Zaire',
      province: 'Zaire',
      capacity: 15000,
      current_stock: 2500,
      species: ['Eucalipto', 'Girassonde'],
      status: 'active',
    },
    {
      id: '4',
      name: 'Viveiro IDF Luanda',
      location: 'Viana, Luanda',
      province: 'Luanda',
      capacity: 25000,
      current_stock: 0,
      species: ['Acácia', 'Pau-rosa'],
      status: 'maintenance',
    },
  ];

  const filteredNurseries = displayNurseries.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.location.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      active: { label: 'Activo', variant: 'default' },
      inactive: { label: 'Inactivo', variant: 'secondary' },
      maintenance: { label: 'Manutenção', variant: 'destructive' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'secondary' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStockLevel = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalCapacity = displayNurseries.reduce((sum, n) => sum + n.capacity, 0);
  const totalStock = displayNurseries.reduce((sum, n) => sum + n.current_stock, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Sprout className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayNurseries.length}</p>
                <p className="text-sm text-muted-foreground">Viveiros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalStock / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground">Mudas em Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalCapacity / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Capacidade Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Sprout className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{((totalStock / totalCapacity) * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Ocupação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Viveiros Florestais</CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Viveiro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registar Novo Viveiro</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Viveiro</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Viveiro Central" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Município, Província" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacidade</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="current_stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Actual</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espécies (separadas por vírgula)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Eucalipto, Acácia, Mukwa" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Registar</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar viveiros..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Stock / Capacidade</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Espécies</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNurseries.map((nursery) => {
                const occupancy = (nursery.current_stock / nursery.capacity) * 100;
                return (
                  <TableRow key={nursery.id}>
                    <TableCell className="font-medium">{nursery.name}</TableCell>
                    <TableCell>{nursery.location}</TableCell>
                    <TableCell>
                      <span className="font-medium">{nursery.current_stock.toLocaleString()}</span>
                      <span className="text-muted-foreground"> / {nursery.capacity.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{occupancy.toFixed(0)}%</span>
                        </div>
                        <Progress value={occupancy} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {nursery.species.slice(0, 2).map(sp => (
                          <Badge key={sp} variant="outline" className="text-xs">{sp}</Badge>
                        ))}
                        {nursery.species.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{nursery.species.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(nursery.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
