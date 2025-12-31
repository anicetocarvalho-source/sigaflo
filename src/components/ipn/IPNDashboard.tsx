import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Building2, 
  User, 
  Search,
  TrendingUp,
  FileCheck,
  Wheat,
  Award,
  Filter
} from 'lucide-react';
import { useProductiveProfiles, useIPNStats } from '@/hooks/useIPN';
import { useProvinces } from '@/hooks/useFarmers';
import { ProductiveProfileCard } from './ProductiveProfileCard';
import { ProductiveProfileDetail } from './ProductiveProfileDetail';
import { Skeleton } from '@/components/ui/skeleton';

export function IPNDashboard() {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  const { data: stats, isLoading: statsLoading } = useIPNStats();
  const { data: provinces } = useProvinces();
  const { data: profiles, isLoading: profilesLoading } = useProductiveProfiles({
    type: typeFilter !== 'all' ? typeFilter as any : undefined,
    provinceId: provinceFilter !== 'all' ? provinceFilter : undefined,
    minScore: scoreFilter !== 'all' ? parseInt(scoreFilter) : undefined
  });

  const filteredProfiles = profiles?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tradeName?.toLowerCase().includes(search.toLowerCase()) ||
    p.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedProfileId) {
    return (
      <ProductiveProfileDetail
        profileId={selectedProfileId}
        onBack={() => setSelectedProfileId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalProfiles || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Perfis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.individuals || 0}
                </p>
                <p className="text-xs text-muted-foreground">Individuais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.cooperatives || 0}
                </p>
                <p className="text-xs text-muted-foreground">Cooperativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.companies || 0}
                </p>
                <p className="text-xs text-muted-foreground">Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wheat className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : `${stats?.productionCoverage || 0}%`}
                </p>
                <p className="text-xs text-muted-foreground">Com Produção</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : `${stats?.certificationCoverage || 0}%`}
                </p>
                <p className="text-xs text-muted-foreground">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, registo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="farmer">Individual</SelectItem>
                <SelectItem value="cooperative">Cooperativa</SelectItem>
                <SelectItem value="company">Empresa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Província" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as províncias</SelectItem>
                {provinces?.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Score Mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer score</SelectItem>
                <SelectItem value="80">≥ 80 (Excelente)</SelectItem>
                <SelectItem value="60">≥ 60 (Bom)</SelectItem>
                <SelectItem value="40">≥ 40 (Regular)</SelectItem>
                <SelectItem value="20">≥ 20 (Baixo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Perfis Produtivos
            {filteredProfiles && (
              <Badge variant="secondary" className="ml-2">
                {filteredProfiles.length} resultados
              </Badge>
            )}
          </h3>
        </div>

        {profilesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredProfiles && filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map(profile => (
              <ProductiveProfileCard
                key={profile.id}
                profile={profile}
                onViewDetails={setSelectedProfileId}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum perfil encontrado</p>
              <p className="text-sm text-muted-foreground">Ajuste os filtros para ver resultados</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
