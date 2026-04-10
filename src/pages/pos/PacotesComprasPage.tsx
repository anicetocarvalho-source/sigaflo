import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { usePurchasePackages, useCreatePackage, usePOSProducts } from '@/hooks/usePOS';
import { Package, Plus, Search, BarChart3 } from 'lucide-react';

export default function PacotesComprasPage() {
  const { data: packages, isLoading } = usePurchasePackages();
  const { data: products } = usePOSProducts();
  const createPackage = useCreatePackage();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newPkg, setNewPkg] = useState({ campaign: '', crop_type: '' });
  const [newItems, setNewItems] = useState<Array<{ product_name: string; max_quantity: number }>>([]);

  const filtered = packages?.filter((p: any) =>
    p.campaign?.toLowerCase().includes(search.toLowerCase()) ||
    (p as any).farmers?.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const addItem = () => setNewItems(prev => [...prev, { product_name: '', max_quantity: 0 }]);
  const updateItem = (idx: number, field: string, value: any) => {
    setNewItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const removeItem = (idx: number) => setNewItems(prev => prev.filter((_, i) => i !== idx));

  const handleCreate = () => {
    createPackage.mutate({
      package: { campaign: newPkg.campaign, crop_type: newPkg.crop_type, campaign_year: new Date().getFullYear() },
      items: newItems.filter(i => i.product_name && i.max_quantity > 0),
    });
    setShowCreate(false);
    setNewPkg({ campaign: '', crop_type: '' });
    setNewItems([]);
  };

  return (
    <MainLayout title="Pacotes de Compras" subtitle="Gestão de quotas por campanha agrícola">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar pacotes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Novo Pacote</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Cultura</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">A carregar...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum pacote encontrado</TableCell></TableRow>
                ) : filtered.map((pkg: any) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.campaign}</TableCell>
                    <TableCell>{(pkg as any).farmers?.name || 'Geral'}</TableCell>
                    <TableCell>{pkg.crop_type || 'N/A'}</TableCell>
                    <TableCell><Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>{pkg.status}</Badge></TableCell>
                    <TableCell>{pkg.purchase_package_items?.length || 0}</TableCell>
                    <TableCell>{new Date(pkg.created_at).toLocaleDateString('pt-AO')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Pacote de Compras</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Campanha</Label><Input value={newPkg.campaign} onChange={e => setNewPkg(p => ({ ...p, campaign: e.target.value }))} placeholder="Ex: Campanha Agrícola 2026" /></div>
              <div><Label>Cultura</Label><Input value={newPkg.crop_type} onChange={e => setNewPkg(p => ({ ...p, crop_type: e.target.value }))} placeholder="Ex: Milho, Arroz" /></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Itens do Pacote</Label>
                  <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
                </div>
                {newItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input placeholder="Produto" value={item.product_name} onChange={e => updateItem(idx, 'product_name', e.target.value)} className="flex-1" />
                    <Input type="number" placeholder="Qtd Máx" value={item.max_quantity || ''} onChange={e => updateItem(idx, 'max_quantity', parseInt(e.target.value) || 0)} className="w-24" />
                    <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-destructive">✕</Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createPackage.isPending}>Criar Pacote</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
