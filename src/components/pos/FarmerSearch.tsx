import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { prepareSearchTerm, validate, searchTermSchema } from '@/lib/validation/search';

interface FarmerSearchProps {
  onSelect: (farmer: any, representative?: { name: string; bi: string; relationship: string }) => void;
}

export function FarmerSearch({ onSelect }: FarmerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [repName, setRepName] = useState('');
  const [repBI, setRepBI] = useState('');
  const [repRelationship, setRepRelationship] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('id, name, registration_number, bi_number, phone, status, province_id, provinces(name)')
        .or(`name.ilike.%${query}%,bi_number.ilike.%${query}%,registration_number.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      setResults(data || []);
      if (!data?.length) toast.info('Nenhum agricultor encontrado');
    } catch {
      toast.error('Erro na pesquisa');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (farmer: any) => {
    const rep = isRepresentative ? { name: repName, bi: repBI, relationship: repRelationship } : undefined;
    if (isRepresentative && (!repName || !repBI)) {
      toast.error('Preencha os dados do representante');
      return;
    }
    onSelect(farmer, rep);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Identificação do Agricultor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome, BI ou Nº de Registo..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <Button onClick={search} disabled={loading}>
              {loading ? 'A pesquisar...' : 'Pesquisar'}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isRepresentative} onCheckedChange={setIsRepresentative} id="rep-toggle" />
            <Label htmlFor="rep-toggle" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Compra por representante
            </Label>
          </div>

          {isRepresentative && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50 border">
              <div>
                <Label>Nome do Representante</Label>
                <Input value={repName} onChange={e => setRepName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <Label>BI do Representante</Label>
                <Input value={repBI} onChange={e => setRepBI(e.target.value)} placeholder="Nº do BI" />
              </div>
              <div>
                <Label>Parentesco</Label>
                <Input value={repRelationship} onChange={e => setRepRelationship(e.target.value)} placeholder="Ex: Cônjuge, Filho" />
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map(farmer => (
                <div
                  key={farmer.id}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelect(farmer)}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{farmer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {farmer.registration_number} • BI: {farmer.bi_number || 'N/A'} • {(farmer as any).provinces?.name || ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${farmer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {farmer.status === 'active' ? 'Activo' : farmer.status === 'suspended' ? 'Suspenso' : 'Rascunho'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
