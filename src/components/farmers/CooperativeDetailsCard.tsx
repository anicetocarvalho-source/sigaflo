import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Briefcase, Users, Leaf, ExternalLink } from 'lucide-react';
import { useCooperativeDetails } from '@/hooks/useCooperative';

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-sm">{value ?? '—'}</p>
  </div>
);

const formatAOA = (v?: number | null) =>
  v == null ? '—' : new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v);

export const CooperativeDetailsCard = ({ farmerId }: { farmerId: string }) => {
  const { data: d, isLoading } = useCooperativeDetails(farmerId);

  if (isLoading) return <p className="text-sm text-muted-foreground">A carregar detalhes da cooperativa...</p>;
  if (!d) return (
    <Card><CardContent className="py-6 text-sm text-muted-foreground">
      Sem detalhes específicos registados. Edite a cooperativa para preencher dados jurídicos, órgãos sociais e estrutura.
    </CardContent></Card>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" />Dados Jurídicos</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="NIF" value={d.nif} />
          <Field label="Data de Constituição" value={d.legal_constitution_date} />
          <Field label="Nº Registo DNCM/IFAP" value={d.dncm_registration_number} />
          <Field label="Grau" value={d.degree === 'first_degree' ? '1º Grau' : d.degree === 'second_degree' ? '2º Grau' : '—'} />
          {d.statutes_url && (
            <a href={d.statutes_url} target="_blank" rel="noreferrer" className="text-primary text-sm flex items-center gap-1 col-span-2">
              <ExternalLink className="h-3 w-3" /> Estatutos
            </a>
          )}
          {d.license_url && (
            <a href={d.license_url} target="_blank" rel="noreferrer" className="text-primary text-sm flex items-center gap-1 col-span-2">
              <ExternalLink className="h-3 w-3" /> Alvará / Licença
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4" />Órgãos Sociais</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Presidente" value={d.president_name} />
          <Field label="Tel. Presidente" value={d.president_phone} />
          <Field label="Secretário" value={d.secretary_name} />
          <Field label="Tesoureiro" value={d.treasurer_name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />Estrutura Associativa</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Total Cooperados" value={d.total_members} />
          <Field label="Capital Social" value={formatAOA(d.share_capital_aoa)} />
          <Field label="Quota Mínima" value={formatAOA(d.minimum_quota_aoa)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Leaf className="h-4 w-4" />Atividade Agregada</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Área Agregada (ha)" value={d.aggregated_area_ha?.toLocaleString('pt-PT')} />
          {d.infrastructures && d.infrastructures.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Infraestruturas</p>
              <div className="flex flex-wrap gap-1">
                {d.infrastructures.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}
              </div>
            </div>
          )}
          {d.notes && <Field label="Notas" value={d.notes} />}
        </CardContent>
      </Card>
    </div>
  );
};
