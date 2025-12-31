import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDatasets } from '@/hooks/useDataLab';
import { Database, Search, Lock, Unlock, Eye, FileText, Table2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DatasetsCatalog() {
  const [search, setSearch] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const { data: datasets, isLoading } = useDatasets();

  const filteredDatasets = datasets?.filter(ds =>
    ds.name.toLowerCase().includes(search.toLowerCase()) ||
    ds.description?.toLowerCase().includes(search.toLowerCase()) ||
    ds.data_category.toLowerCase().includes(search.toLowerCase())
  );

  const getSensitivityBadge = (level: string) => {
    switch (level) {
      case 'public': return <Badge className="bg-green-500"><Unlock className="h-3 w-3 mr-1" />Público</Badge>;
      case 'internal': return <Badge className="bg-blue-500"><Eye className="h-3 w-3 mr-1" />Interno</Badge>;
      case 'restricted': return <Badge className="bg-orange-500"><Lock className="h-3 w-3 mr-1" />Restrito</Badge>;
      case 'confidential': return <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Confidencial</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      production: 'bg-emerald-500',
      climate: 'bg-sky-500',
      forestry: 'bg-lime-600',
      farmers: 'bg-amber-500',
      certificates: 'bg-violet-500',
      incentives: 'bg-pink-500',
    };
    return <Badge className={colors[category] || 'bg-gray-500'}>{category}</Badge>;
  };

  const dataset = datasets?.find(d => d.id === selectedDataset);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Catálogo de Datasets
          </CardTitle>
          <CardDescription>
            Explore os conjuntos de dados disponíveis no SIGAFLO para análise e investigação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dataset Cards */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando catálogo...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDatasets?.map((ds) => (
                <Card key={ds.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Table2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{ds.name}</CardTitle>
                      </div>
                      {getSensitivityBadge(ds.sensitivity_level)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ds.description || 'Sem descrição disponível'}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(ds.data_category)}
                      <Badge variant="outline" className="text-xs">
                        {ds.code}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {ds.available_fields.length} campos disponíveis
                      </span>
                      {ds.min_aggregation_level && (
                        <span className="text-xs text-muted-foreground">
                          Agregação: {ds.min_aggregation_level}
                        </span>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedDataset(ds.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Table2 className="h-5 w-5" />
                            {ds.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            {getSensitivityBadge(ds.sensitivity_level)}
                            {getCategoryBadge(ds.data_category)}
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Descrição</h4>
                            <p className="text-sm text-muted-foreground">
                              {ds.description || 'Sem descrição disponível'}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Campos Disponíveis</h4>
                            <div className="flex flex-wrap gap-1">
                              {ds.available_fields.map((field) => (
                                <Badge key={field} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {ds.restricted_fields.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-orange-600">Campos Restritos</h4>
                              <div className="flex flex-wrap gap-1">
                                {ds.restricted_fields.map((field) => (
                                  <Badge key={field} variant="outline" className="text-xs text-orange-600">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground">Tabela Fonte</p>
                              <p className="font-mono text-sm">{ds.source_table}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Agregação Mínima</p>
                              <p className="text-sm capitalize">
                                {ds.min_aggregation_level || 'Nenhuma'}
                              </p>
                            </div>
                          </div>

                          <Button className="w-full">
                            Solicitar Acesso
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDatasets?.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dataset encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
