import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOrganizations, useCreateOrganization } from '@/hooks/useDataLab';
import { Building2, Plus, Search, Globe, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function OrganizationsManager() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: organizations, isLoading } = useOrganizations();
  const createOrg = useCreateOrganization();

  const [newOrg, setNewOrg] = useState({
    code: '',
    name: '',
    organization_type: 'university',
    country: 'Angola',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    agreement_reference: '',
    max_concurrent_users: 3,
  });

  const filteredOrgs = organizations?.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.code.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      ine: 'bg-blue-500',
      university: 'bg-purple-500',
      international: 'bg-green-500',
      research_center: 'bg-orange-500',
      ngo: 'bg-pink-500',
    };
    const labels: Record<string, string> = {
      ine: 'INE',
      university: 'Universidade',
      international: 'Internacional',
      research_center: 'Centro de Pesquisa',
      ngo: 'ONG',
    };
    return <Badge className={colors[type]}>{labels[type] || type}</Badge>;
  };

  const handleCreate = () => {
    createOrg.mutate(newOrg as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewOrg({
          code: '',
          name: '',
          organization_type: 'university',
          country: 'Angola',
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          agreement_reference: '',
          max_concurrent_users: 3,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizações Parceiras
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Organização
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registar Nova Organização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input
                      value={newOrg.code}
                      onChange={(e) => setNewOrg({ ...newOrg, code: e.target.value })}
                      placeholder="Ex: UAN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newOrg.organization_type}
                      onValueChange={(v) => setNewOrg({ ...newOrg, organization_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ine">INE</SelectItem>
                        <SelectItem value="university">Universidade</SelectItem>
                        <SelectItem value="international">Internacional</SelectItem>
                        <SelectItem value="research_center">Centro de Pesquisa</SelectItem>
                        <SelectItem value="ngo">ONG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nome da Organização</Label>
                  <Input
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>País</Label>
                    <Input
                      value={newOrg.country}
                      onChange={(e) => setNewOrg({ ...newOrg, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Utilizadores</Label>
                    <Input
                      type="number"
                      value={newOrg.max_concurrent_users}
                      onChange={(e) => setNewOrg({ ...newOrg, max_concurrent_users: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nome do Contacto</Label>
                  <Input
                    value={newOrg.contact_name}
                    onChange={(e) => setNewOrg({ ...newOrg, contact_name: e.target.value })}
                    placeholder="Pessoa de contacto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newOrg.contact_email}
                      onChange={(e) => setNewOrg({ ...newOrg, contact_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={newOrg.contact_phone}
                      onChange={(e) => setNewOrg({ ...newOrg, contact_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Referência do Acordo/MOU</Label>
                  <Input
                    value={newOrg.agreement_reference}
                    onChange={(e) => setNewOrg({ ...newOrg, agreement_reference: e.target.value })}
                    placeholder="Número do protocolo"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={!newOrg.code || !newOrg.name}>
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
            placeholder="Pesquisar organizações..."
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
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Utilizadores</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando organizações...
                  </TableCell>
                </TableRow>
              ) : filteredOrgs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma organização encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrgs?.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-mono">{org.code}</TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{getTypeBadge(org.organization_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        {org.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{org.contact_name || '-'}</p>
                        <p className="text-muted-foreground">{org.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {org.max_concurrent_users}
                      </div>
                    </TableCell>
                    <TableCell>
                      {org.is_active ? (
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
