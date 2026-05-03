import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Wallet, CloudRain, TrendingUp, Users, GraduationCap, MapPin, Calendar, Building2 } from 'lucide-react';

interface QuickStatsProps {
  farmer: any;
  members: any[];
  coopDetails?: any;
  ecaDetails?: any;
  creditScore: number;
  getScoreColor: (s: number) => string;
  getScoreIcon: (s: number) => React.ReactNode;
  totalIncentivesReceived: number;
  farmerOccurrencesCount: number;
}

const Stat = ({ icon, value, label, tone = 'primary' }: { icon: React.ReactNode; value: React.ReactNode; label: string; tone?: string }) => {
  const tones: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${tones[tone] || tones.primary}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickStats = ({
  farmer, members, coopDetails, ecaDetails, creditScore, getScoreColor, getScoreIcon,
  totalIncentivesReceived, farmerOccurrencesCount,
}: QuickStatsProps) => {
  const t = farmer.farmer_type;

  if (t === 'cooperative') {
    const declared = coopDetails?.total_members ?? 0;
    const computed = members.length;
    const area = coopDetails?.aggregated_area_ha ?? members.reduce((s, m) => s + (m.cultivated_area_ha || 0), 0);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users className="h-5 w-5" />} value={`${computed}/${declared || '—'}`} label="Cooperados (real/declarado)" tone="blue" />
        <Stat icon={<Leaf className="h-5 w-5" />} value={`${Number(area || 0).toFixed(1)} ha`} label="Área Agregada" tone="primary" />
        <Stat icon={<MapPin className="h-5 w-5" />} value={coopDetails?.focus_crop || '—'} label="Cultura Focal" tone="green" />
        <Stat icon={<CloudRain className="h-5 w-5" />} value={farmerOccurrencesCount} label="Ocorrências" tone="orange" />
      </div>
    );
  }

  if (t === 'field_school') {
    const total = ecaDetails?.participants_count ?? members.length;
    const m = ecaDetails?.participants_male ?? 0;
    const f = ecaDetails?.participants_female ?? 0;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<GraduationCap className="h-5 w-5" />} value={total} label={`Participantes (♂${m} ♀${f})`} tone="purple" />
        <Stat icon={<Leaf className="h-5 w-5" />} value={ecaDetails?.focus_crop || '—'} label="Cultura Focal" tone="green" />
        <Stat icon={<MapPin className="h-5 w-5" />} value={`${Number(ecaDetails?.demo_parcel_area_ha || 0).toFixed(1)} ha`} label="Parcela Demonstrativa" tone="primary" />
        <Stat icon={<Calendar className="h-5 w-5" />} value={ecaDetails?.duration_months ? `${ecaDetails.duration_months} m` : '—'} label="Duração" tone="orange" />
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
