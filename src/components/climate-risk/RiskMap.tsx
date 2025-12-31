import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProvinceRiskProfiles, useCropRiskProfiles } from '@/hooks/useClimateRisk';
import { MapPin, Wheat, AlertTriangle, TrendingUp } from 'lucide-react';

export function RiskMap() {
  const [viewMode, setViewMode] = useState<'province' | 'crop'>('province');
  const { data: provinceProfiles, isLoading: loadingProvinces } = useProvinceRiskProfiles();
  const { data: cropProfiles, isLoading: loadingCrops } = useCropRiskProfiles();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'high': return <Badge className="bg-orange-500">Alto</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-yellow-950">Médio</Badge>;
      default: return <Badge className="bg-green-500">Baixo</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B Kz`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M Kz`;
    }
    return `${(value / 1000).toFixed(0)}K Kz`;
  };

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mapa Nacional de Risco</h3>
          <p className="text-sm text-muted-foreground">
            Análise de risco climático por {viewMode === 'province' ? 'província' : 'cultura'}
          </p>
        </div>
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'province' | 'crop')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="province">Por Província</SelectItem>
            <SelectItem value="crop">Por Cultura</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'province' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loadingProvinces ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Carregando perfis de risco...
            </div>
          ) : (
            provinceProfiles?.map((profile) => (
              <Card key={profile.province_id} className="overflow-hidden">
                <div className={`h-1 ${getRiskColor(profile.risk_level)}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.province_name}
                    </CardTitle>
                    {getRiskBadge(profile.risk_level)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Índice de Risco</span>
                      <span className="font-medium">{profile.risk_score}%</span>
                    </div>
                    <Progress value={profile.risk_score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Eventos</p>
                      <p className="font-semibold">{profile.events_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Agricultores</p>
                      <p className="font-semibold">{profile.farmers_affected}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Área Afectada</p>
                      <p className="font-semibold">{profile.total_affected_area_ha.toLocaleString()} ha</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Perdas</p>
                      <p className="font-semibold">{formatCurrency(profile.total_loss_aoa)}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Evento Dominante</p>
                    <Badge variant="outline" className="mt-1">
                      {profile.dominant_event_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loadingCrops ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Carregando perfis de risco...
            </div>
          ) : (
            cropProfiles?.map((profile) => (
              <Card key={profile.crop} className="overflow-hidden">
                <div className={`h-1 ${getRiskColor(profile.risk_level)}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wheat className="h-4 w-4" />
                      {profile.crop}
                    </CardTitle>
                    {getRiskBadge(profile.risk_level)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Índice de Risco</span>
                      <span className="font-medium">{profile.risk_score}%</span>
                    </div>
                    <Progress value={profile.risk_score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Eventos</p>
                      <p className="font-semibold">{profile.events_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Área Total</p>
                      <p className="font-semibold">{profile.total_area_ha.toLocaleString()} ha</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Perdas Totais</p>
                      <p className="font-semibold">{formatCurrency(profile.total_loss_aoa)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Perda/Evento</p>
                      <p className="font-semibold">{formatCurrency(profile.avg_loss_per_event)}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Produção Total</p>
                    <p className="font-medium mt-1">
                      {(profile.total_production_kg / 1000).toLocaleString()} ton
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Risk Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">Baixo (0-24%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-sm">Médio (25-49%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-sm">Alto (50-74%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm">Crítico (75-100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
