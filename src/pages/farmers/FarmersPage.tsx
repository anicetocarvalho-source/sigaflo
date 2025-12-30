import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Filter,
  Download,
  Users,
  UserCheck,
  Building2,
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  FileCheck,
} from 'lucide-react';

const mockFarmers = [
  {
    id: '1',
    name: 'João Pedro Mutemba',
    type: 'small',
    province: 'Huambo',
    municipality: 'Bailundo',
    area: 2.5,
    crops: ['Milho', 'Feijão'],
    status: 'approved',
    registrationDate: '2024-03-15',
  },
  {
    id: '2',
    name: 'Maria Antónia Santos',
    type: 'family',
    province: 'Bié',
    municipality: 'Kuito',
    area: 8.2,
    crops: ['Arroz', 'Mandioca'],
    status: 'validated',
    registrationDate: '2024-05-22',
  },
  {
    id: '3',
    name: 'Cooperativa Agrícola do Planalto',
    type: 'large',
    province: 'Huíla',
    municipality: 'Lubango',
    area: 450,
    crops: ['Trigo', 'Batata', 'Cebola'],
    status: 'approved',
    registrationDate: '2023-11-08',
  },
  {
    id: '4',
    name: 'Francisco Domingos',
    type: 'small',
    province: 'Malanje',
    municipality: 'Cacuso',
    area: 1.8,
    crops: ['Amendoim', 'Sorgo'],
    status: 'submitted',
    registrationDate: '2024-12-10',
  },
  {
    id: '5',
    name: 'Associação de Mulheres Rurais',
    type: 'family',
    province: 'Cuanza Sul',
    municipality: 'Sumbe',
    area: 15.5,
    crops: ['Arroz', 'Hortícolas'],
    status: 'approved',
    registrationDate: '2024-01-20',
  },
];

const typeLabels = {
  small: 'Pequeno',
  family: 'Familiar',
  large: 'Grande',
};

const typeColors = {
  small: 'bg-info/10 text-info',
  family: 'bg-success/10 text-success',
  large: 'bg-accent/10 text-accent-foreground',
};

const statusLabels = {
  draft: 'Rascunho',
  submitted: 'Submetido',
  validated: 'Validado',
  approved: 'Aprovado',
  issued: 'Emitido',
  rejected: 'Rejeitado',
};

const statusColors = {
  draft: 'status-draft',
  submitted: 'status-submitted',
  validated: 'status-validated',
  approved: 'status-approved',
  issued: 'status-issued',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarmers = mockFarmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout
      title="Gestão de Agricultores"
      subtitle="Registo e acompanhamento de agricultores em todo o território"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">892.450</p>
                <p className="text-sm text-muted-foreground">Total Registados</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2.5">
                <UserCheck className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">756.230</p>
                <p className="text-sm text-muted-foreground">Pequenos Agricultores</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <Building2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2.450</p>
                <p className="text-sm text-muted-foreground">Cooperativas</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2.5">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">18</p>
                <p className="text-sm text-muted-foreground">Províncias Cobertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar agricultores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Registo
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Nome / Designação
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Localização
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Área (ha)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Culturas
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Acções
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{farmer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Registado em {new Date(farmer.registrationDate).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${typeColors[farmer.type as keyof typeof typeColors]}`}>
                        {typeLabels[farmer.type as keyof typeof typeLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {farmer.municipality}, {farmer.province}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {farmer.area.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {farmer.crops.slice(0, 2).map((crop, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {crop}
                          </span>
                        ))}
                        {farmer.crops.length > 2 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            +{farmer.crops.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${statusColors[farmer.status as keyof typeof statusColors]}`}>
                        {statusLabels[farmer.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Mostrando 1-5 de 892.450 resultados
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
