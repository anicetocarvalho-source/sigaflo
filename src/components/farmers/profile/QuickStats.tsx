import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Wallet, CloudRain, TrendingUp, Users, GraduationCap, MapPin, Calendar, Building2, AlertTriangle } from 'lucide-react';

interface QuickStatsProps {
  farmer: any;
  members: any[];
  coopDetails?: any;
  ecaDetails?: any;
  loadingCoopDetails?: boolean;
  loadingEcaDetails?: boolean;
  creditScore: number;
  getScoreColor: (s: number) => string;
  getScoreIcon: (s: number) => React.ReactNode;
  totalIncentivesReceived: number;
  farmerOccurrencesCount: number;
}

const Stat = ({
  icon, value, label, tone = 'primary', hint, warn,
}: { icon: React.ReactNode; value: React.ReactNode; label: string; tone?: string; hint?: string; warn?: boolean }) => {
  const tones: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    muted: 'bg-muted text-muted-foreground',
  };
  return (
    <Card className={warn ? 'border-orange-300' : undefined}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${tones[tone] || tones.primary}`}>{icon}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold truncate">{value}</p>
              {warn && <AlertTriangle className="h-4 w-4 text-orange-500" aria-label="Inconsistência detectada" />}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {hint && <p className="text-xs text-muted-foreground/80 mt-0.5">{hint}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SkeletonStat = ({ label }: { label: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted h-9 w-9 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const QuickStats = ({
  farmer, members, coopDetails, ecaDetails, loadingCoopDetails, loadingEcaDetails,
  creditScore, getScoreColor, getScoreIcon,
  totalIncentivesReceived, farmerOccurrencesCount,
}: QuickStatsProps) => {
  const t = farmer.farmer_type;

  if (t === 'cooperative') {
    if (loadingCoopDetails) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonStat label="Cooperados" />
          <SkeletonStat label="Área Agregada" />
          <SkeletonStat label="Cultura Focal" />
          <SkeletonStat label="Ocorrências" />
        </div>
      );
    }
    const hasDetails = !!coopDetails;
    const computed = members.length;
    const declared = coopDetails?.total_members ?? null;
    const computedArea = members.reduce((s, m) => s + (Number(m.cultivated_area_ha) || 0), 0);
    const declaredArea = coopDetails?.aggregated_area_ha ?? null;
    const memberMismatch = hasDetails && declared !== null && declared !== computed;
    const areaMismatch = hasDetails && declaredArea !== null && Math.abs(Number(declaredArea) - computedArea) > 0.5;

    return (
      <div className="space-y-2">
        {!hasDetails && (
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            <AlertTriangle className="h-3 w-3 mr-1" /> Sem ficha de cooperativa — dados estimados a partir dos membros
          </Badge>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<Users className="h-5 w-5" />}
            value={hasDetails ? `${computed}/${declared ?? '—'}` : `${computed}`}
            label="Cooperados (real/declarado)"
            tone="blue"
            warn={memberMismatch}
            hint={!hasDetails ? 'Apenas valor real (sem declaração)' : undefined}
          />
          <Stat
            icon={<Leaf className="h-5 w-5" />}
            value={`${Number((declaredArea ?? computedArea) || 0).toFixed(1)} ha`}
            label="Área Agregada"
            tone="primary"
            warn={areaMismatch}
            hint={!hasDetails ? 'Soma das parcelas dos membros' : (areaMismatch ? `Calculada: ${computedArea.toFixed(1)} ha` : undefined)}
          />
          <Stat
            icon={<MapPin className="h-5 w-5" />}
            value={coopDetails?.focus_crop || '—'}
            label="Cultura Focal"
            tone={coopDetails?.focus_crop ? 'green' : 'muted'}
            hint={!coopDetails?.focus_crop ? 'Não declarada' : undefined}
          />
          <Stat icon={<CloudRain className="h-5 w-5" />} value={farmerOccurrencesCount} label="Ocorrências" tone="orange" />
        </div>
      </div>
    );
  }

  if (t === 'field_school') {
    if (loadingEcaDetails) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonStat label="Participantes" />
          <SkeletonStat label="Cultura Focal" />
          <SkeletonStat label="Parcela Demonstrativa" />
          <SkeletonStat label="Duração" />
        </div>
      );
    }
    const hasDetails = !!ecaDetails;
    const computed = members.length;
    const declared = ecaDetails?.participants_count ?? null;
    const m = ecaDetails?.participants_male ?? null;
    const f = ecaDetails?.participants_female ?? null;
    const sumGender = (m ?? 0) + (f ?? 0);
    const genderMismatch = hasDetails && declared !== null && (m !== null || f !== null) && sumGender !== declared;
    const participantsMismatch = hasDetails && declared !== null && declared !== computed;

    return (
      <div className="space-y-2">
        {!hasDetails && (
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            <AlertTriangle className="h-3 w-3 mr-1" /> Sem ficha de ECA — dados estimados a partir dos participantes
          </Badge>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<GraduationCap className="h-5 w-5" />}
            value={hasDetails ? `${computed}/${declared ?? '—'}` : `${computed}`}
            label={hasDetails && (m !== null || f !== null) ? `Participantes (♂${m ?? 0} ♀${f ?? 0})` : 'Participantes'}
            tone="purple"
            warn={participantsMismatch || genderMismatch}
            hint={genderMismatch ? `Soma M+F (${sumGender}) ≠ declarado (${declared})` : undefined}
          />
          <Stat
            icon={<Leaf className="h-5 w-5" />}
            value={ecaDetails?.focus_crop || '—'}
            label="Cultura Focal"
            tone={ecaDetails?.focus_crop ? 'green' : 'muted'}
            hint={!ecaDetails?.focus_crop ? 'Não declarada' : undefined}
          />
          <Stat
            icon={<MapPin className="h-5 w-5" />}
            value={ecaDetails?.demo_parcel_area_ha != null ? `${Number(ecaDetails.demo_parcel_area_ha).toFixed(1)} ha` : '—'}
            label="Parcela Demonstrativa"
            tone={ecaDetails?.demo_parcel_area_ha != null ? 'primary' : 'muted'}
            hint={ecaDetails?.demo_parcel_area_ha == null ? 'Não declarada' : undefined}
          />
          <Stat
            icon={<Calendar className="h-5 w-5" />}
            value={ecaDetails?.duration_months ? `${ecaDetails.duration_months} m` : '—'}
            label="Duração"
            tone={ecaDetails?.duration_months ? 'orange' : 'muted'}
            hint={!ecaDetails?.duration_months ? 'Não definida' : undefined}
          />
        </div>
      </div>
    );
  }

  if (t === 'company') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Leaf className="h-5 w-5" />} value={`${farmer.cultivated_area_ha?.toFixed(1) || '—'} ha`} label="Área Cultivada" />
        <Stat icon={<Building2 className="h-5 w-5" />} value={farmer.trade_name || '—'} label="Nome Comercial" tone="purple" />
        <Stat icon={<Wallet className="h-5 w-5" />} value={totalIncentivesReceived > 0 ? `${(totalIncentivesReceived / 1_000_000).toFixed(1)}M` : '0'} label="Incentivos (AOA)" tone="green" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} value={creditScore || '—'} label="Score Crédito" tone="blue" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Stat icon={<Leaf className="h-5 w-5" />} value={`${farmer.cultivated_area_ha?.toFixed(1) || '—'} ha`} label="Área Cultivada" />
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getScoreColor(creditScore)}`}>{getScoreIcon(creditScore)}</div>
            <div>
              <p className="text-2xl font-bold">{creditScore || '—'}</p>
              <p className="text-sm text-muted-foreground">Score Produtivo</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Stat icon={<Wallet className="h-5 w-5" />} value={totalIncentivesReceived > 0 ? `${(totalIncentivesReceived / 1_000_000).toFixed(1)}M` : '0'} label="Incentivos (AOA)" tone="green" />
      <Stat icon={<CloudRain className="h-5 w-5" />} value={farmerOccurrencesCount} label="Ocorrências Climáticas" tone="orange" />
    </div>
  );
};
