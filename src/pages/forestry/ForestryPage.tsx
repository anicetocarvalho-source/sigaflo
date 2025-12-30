import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import {
  TreePine,
  FileCheck,
  Truck,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  QrCode,
  MapPin,
} from 'lucide-react';

const licenses = [
  {
    id: 'LF-2024-0892',
    type: 'exploitation',
    company: 'Madeira Angola Lda',
    province: 'Cabinda',
    species: ['Undianuno', 'Muirapiranga'],
    volume: 2500,
    status: 'approved',
    expiryDate: '2025-06-30',
  },
  {
    id: 'LF-2024-0891',
    type: 'transport',
    company: 'Floresta Verde SARL',
    province: 'Uíge',
    species: ['Ébano'],
    volume: 850,
    status: 'issued',
    expiryDate: '2024-12-31',
  },
  {
    id: 'LF-2024-0890',
    type: 'export',
    company: 'Exportadora Colonial',
    province: 'Zaire',
    species: ['Pau-ferro', 'Mukula'],
    volume: 1200,
    status: 'validated',
    expiryDate: '2025-03-15',
  },
  {
    id: 'LF-2024-0889',
    type: 'exploitation',
    company: 'Sociedade Florestal do Norte',
    province: 'Lunda Norte',
    species: ['Teca'],
    volume: 3200,
    status: 'submitted',
    expiryDate: '2025-08-20',
  },
];

const typeLabels = {
  exploitation: 'Exploração',
  transport: 'Transporte',
  export: 'Exportação',
};

const typeColors = {
  exploitation: 'bg-primary/10 text-primary',
  transport: 'bg-info/10 text-info',
  export: 'bg-accent/10 text-accent-foreground',
};

const statusLabels = {
  draft: 'Rascunho',
  submitted: 'Submetido',
  validated: 'Validado',
  approved: 'Aprovado',
  issued: 'Emitido',
};

const statusColors = {
  draft: 'status-draft',
  submitted: 'status-submitted',
  validated: 'status-validated',
  approved: 'status-approved',
  issued: 'status-issued',
};

export default function ForestryPage() {
  return (
    <MainLayout
      title="Gestão Florestal"
      subtitle="Licenciamento, rastreabilidade e fiscalização da cadeia da madeira"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Licenças Activas"
            value="1.892"
            subtitle="Em todo o território"
            change={-5.1}
            changeType="decrease"
            icon={<FileCheck className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Volume Autorizado"
            value="45.230"
            subtitle="m³ / ano"
            change={8.2}
            changeType="increase"
            icon={<TreePine className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Transportes Activos"
            value="342"
            subtitle="Em trânsito"
            icon={<Truck className="h-5 w-5" />}
            variant="accent"
          />
          <KPICard
            title="Infrações"
            value="28"
            subtitle="Este mês"
            change={15}
            changeType="decrease"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="warning"
          />
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Pesquisar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Licença
          </Button>
        </div>

        {/* Licenses Table */}
        <div className="card-elevated overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h3 className="font-display font-semibold text-foreground">Licenças Florestais</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Nº Licença
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Província
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Espécies
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Volume (m³)
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
                {licenses.map((license) => (
                  <tr key={license.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono font-medium text-foreground">{license.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Expira: {new Date(license.expiryDate).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${typeColors[license.type as keyof typeof typeColors]}`}>
                        {typeLabels[license.type as keyof typeof typeLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{license.company}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {license.province}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {license.species.map((species, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {species}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {license.volume.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${statusColors[license.status as keyof typeof statusColors]}`}>
                        {statusLabels[license.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traceability Section */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card-elevated p-5">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Rastreabilidade da Madeira
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe o percurso da madeira desde a árvore até ao destino final
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Árvore</p>
                  <p className="text-xs text-muted-foreground">Georreferenciação e marcação</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Tora</p>
                  <p className="text-xs text-muted-foreground">Corte, medição e etiquetagem</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Transporte</p>
                  <p className="text-xs text-muted-foreground">Guia de trânsito e verificação</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Destino</p>
                  <p className="text-xs text-muted-foreground">Indústria, exportação ou venda</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated p-5">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Fiscalização e Denúncias
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Acções de fiscalização e canal de denúncias anónimas
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-foreground">342</p>
                <p className="text-sm text-muted-foreground">Fiscalizações este mês</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-foreground">28</p>
                <p className="text-sm text-muted-foreground">Infrações detectadas</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-destructive">12</p>
                <p className="text-sm text-muted-foreground">Denúncias pendentes</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-3xl font-bold text-success">156</p>
                <p className="text-sm text-muted-foreground">ha Reflorestados</p>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Registar Denúncia
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
