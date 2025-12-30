import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForestTrees, useForestLicenses, type ForestTree } from '@/hooks/useForestry';
import { TreePine, Plus, Search, QrCode, MapPin, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface TreesListProps {
  onAddNew: () => void;
  onView: (tree: ForestTree) => void;
  selectedLicenseId?: string;
  onLicenseChange?: (licenseId: string) => void;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  logged: { label: 'Registada', variant: 'secondary' },
  felled: { label: 'Abatida', variant: 'default' },
  processed: { label: 'Processada', variant: 'outline' },
  in_transport: { label: 'Em Transporte', variant: 'default' },
};

const woodClassColors: Record<string, string> = {
  precious: 'bg-amber-500',
  first_class: 'bg-emerald-500',
  second_class: 'bg-blue-500',
  common: 'bg-slate-500',
};

export function TreesList({ onAddNew, onView, selectedLicenseId, onLicenseChange }: TreesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLicense, setFilterLicense] = useState(selectedLicenseId || 'all');
  const [qrDialogTree, setQrDialogTree] = useState<ForestTree | null>(null);

  const { data: trees = [], isLoading } = useForestTrees(filterLicense === 'all' ? undefined : filterLicense);
  const { data: licenses = [] } = useForestLicenses({ status: 'active' });

  const filteredTrees = trees.filter((tree) =>
    tree.tree_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLicenseChange = (value: string) => {
    setFilterLicense(value);
    onLicenseChange?.(value);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Registo de Árvores
          </CardTitle>
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Árvore
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código ou espécie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterLicense} onValueChange={handleLicenseChange}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por licença" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as licenças</SelectItem>
                {licenses.map((license) => (
                  <SelectItem key={license.id} value={license.id}>
                    {license.license_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredTrees.length === 0 ? (
            <div className="text-center py-8">
              <TreePine className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma árvore registada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Espécie</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Dimensões</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Marcação</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrees.map((tree) => (
                    <TableRow key={tree.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                            {tree.tree_code}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tree.species}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${woodClassColors[tree.wood_class]}`} />
                          <span className="capitalize">{tree.wood_class}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {tree.diameter_cm && <span>⌀ {tree.diameter_cm} cm</span>}
                          {tree.height_m && <span> • {tree.height_m} m</span>}
                          {tree.estimated_volume_m3 && <span> • {tree.estimated_volume_m3} m³</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[tree.status]?.variant || 'secondary'}>
                          {statusLabels[tree.status]?.label || tree.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tree.marked_at && (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(tree.marked_at), "dd/MM/yyyy", { locale: pt })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onView(tree)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setQrDialogTree(tree)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              window.open(`https://maps.google.com/?q=${tree.latitude},${tree.longitude}`, '_blank');
                            }}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialogTree} onOpenChange={() => setQrDialogTree(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code - {qrDialogTree?.tree_code}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDialogTree && (
              <>
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'tree',
                    code: qrDialogTree.tree_code,
                    species: qrDialogTree.species,
                    lat: qrDialogTree.latitude,
                    lng: qrDialogTree.longitude,
                  })}
                  size={200}
                  level="H"
                  includeMargin
                />
                <div className="text-center">
                  <p className="font-medium">{qrDialogTree.species}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Classe: {qrDialogTree.wood_class}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {qrDialogTree.latitude.toFixed(6)}, {qrDialogTree.longitude.toFixed(6)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const svg = document.querySelector('#qr-tree-print svg');
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const blob = new Blob([svgData], { type: 'image/svg+xml' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `arvore-${qrDialogTree.tree_code}.svg`;
                      link.click();
                    }
                  }}
                >
                  Descarregar QR
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
