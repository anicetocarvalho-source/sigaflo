import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResearchers, useOrganizations, useCreateResearcher } from '@/hooks/useDataLab';
import { Users, Plus, Search, Mail, Building2, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function ResearchersManager() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: researchers, isLoading } = useResearchers();
  const { data: organizations } = useOrganizations();
  const createResearcher = useCreateResearcher();

  const [newResearcher, setNewResearcher] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    research_area: '',
    organization_id: '',
    access_level: 'basic',
    max_exports_per_month: 10,
  });

  const filteredResearchers = researchers?.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.research_area?.toLowerCase().includes(search.toLowerCase())
  );

  const getAccessLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-500',
      advanced: 'bg-blue-500',
      full: 'bg-purple-500',
    };
    const labels: Record<string, string> = {
      basic: 'Básico',
      advanced: 'Avançado',
      full: 'Completo',
    };
    return <Badge className={colors[level]}>{labels[level] || level}</Badge>;
  };

  const handleCreate = () => {
    createResearcher.mutate(newResearcher as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewResearcher({
          full_name: '',
          email: '',
          phone: '',
          position: '',
          research_area: '',
          organization_id: '',
          access_level: 'basic',
          max_exports_per_month: 10,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Investigadores
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Investigador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registar Novo Investigador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={newResearcher.full_name}
                    onChange={(e) => setNewResearcher({ ...newResearcher, full_name: e.target.value })}
                    placeholder="Nome do investigador"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newResearcher.email}
                      onChange={(e) => setNewResearcher({ ...newResearcher, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={newResearcher.phone}
                      onChange={(e) => setNewResearcher({ ...newResearcher, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Organização</Label>
                  <Select
                    value={newResearcher.organization_id}
                    onValueChange={(v) => setNewResearcher({ ...newResearcher, organization_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a organização" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations?.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cargo/Posição</Label>
                    <Input
                      value={newResearcher.position}
                      onChange={(e) => setNewResearcher({ ...newResearcher, position: e.target.value })}
                      placeholder="Ex: Professor, Investigador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Área de Pesquisa</Label>
                    <Input
                      value={newResearcher.research_area}
                      onChange={(e) => setNewResearcher({ ...newResearcher, research_area: e.target.value })}
                      placeholder="Ex: Agronomia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nível de Acesso</Label>
                    <Select
                      value={newResearcher.access_level}
                      onValueChange={(v) => setNewResearcher({ ...newResearcher, access_level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                        <SelectItem value="full">Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exports/Mês</Label>
                    <Input
                      type="number"
                      value={newResearcher.max_exports_per_month}
                      onChange={(e) => setNewResearcher({ ...newResearcher, max_exports_per_month: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={!newResearcher.full_name || !newResearcher.email}>
                    Registar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar investigadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Área de Pesquisa</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Exports</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando investigadores...
                  </TableCell>
                </TableRow>
              ) : filteredResearchers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum investigador encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredResearchers?.map((researcher) => (
                  <TableRow key={researcher.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{researcher.full_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {researcher.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {(researcher.organization as any)?.name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        {researcher.research_area || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{getAccessLevelBadge(researcher.access_level)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {researcher.exports_this_month}/{researcher.max_exports_per_month}
                      </span>
                    </TableCell>
                    <TableCell>
                      {researcher.is_active ? (
                        <Badge className="bg-green-500">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
