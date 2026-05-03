import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, HandCoins, MapPin } from 'lucide-react';
import { useFieldSchoolDetails } from '@/hooks/useFieldSchool';

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-sm">{value ?? '—'}</p>
  </div>
);

export const FieldSchoolDetailsCard = ({ farmerId }: { farmerId: string }) => {
  const { data: d, isLoading } = useFieldSchoolDetails(farmerId);

  if (isLoading) return <p className="text-sm text-muted-foreground">A carregar detalhes da Escola de Campo...</p>;
  if (!d) return (
    <Card><CardContent className="py-6 text-sm text-muted-foreground">
      Sem detalhes pedagógicos registados. Edite a ECA para preencher facilitador, currículo e parcela demonstrativa.
    </CardContent></Card>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-4 w-4" />Programa Pedagógico</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Data de Início" value={d.start_date} />
          <Field label="Duração (meses)" value={d.duration_months} />
          <Field label="Cultura Focal" value={d.focus_crop} />
          {d.curriculum_modules && d.curriculum_modules.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Módulos do Currículo</p>
              <div className="flex flex-wrap gap-1">
                {d.curriculum_modules.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />Composição da Turma</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Total Participantes" value={d.participants_count} />
          <Field label="Homens" value={d.participants_male} />
          <Field label="Mulheres" value={d.participants_female} />
          <Field label="Faixa Etária" value={d.avg_age_range} />
          <Field label="Escolaridade Média" value={d.avg_education_level} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><HandCoins className="h-4 w-4" />Patrocínio / Promotor</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Entidade Promotora" value={d.promoter_entity} />
          <Field label="Responsável" value={d.promoter_name} />
          <Field label="Fonte de Financiamento" value={d.funding_source} />
          <Field label="Projeto Associado" value={d.linked_project} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" />Parcela Demonstrativa</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Área (ha)" value={d.demo_parcel_area_ha} />
          <Field label="Coordenadas" value={d.demo_latitude && d.demo_longitude ? `${d.demo_latitude}, ${d.demo_longitude}` : '—'} />
          {d.demo_crops && d.demo_crops.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Culturas Demonstradas</p>
              <div className="flex flex-wrap gap-1">
                {d.demo_crops.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
            </div>
          )}
          {d.notes && <Field label="Notas" value={d.notes} />}
        </CardContent>
      </Card>
    </div>
  );
};
