import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldX, MapPin, Sprout, User, AlertTriangle } from 'lucide-react';
import { useCardVerification } from '@/hooks/useFarmerCards';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function CardVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useCardVerification(token);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <Sprout className="h-7 w-7" /> SIGAFLO
          </div>
          <p className="text-sm text-muted-foreground">Verificação Pública de Cartão de Agricultor</p>
        </header>

        {isLoading && <Skeleton className="h-96 w-full" />}

        {(error || (!isLoading && !data)) && (
          <Card className="border-destructive">
            <CardContent className="p-8 text-center space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold">Cartão não encontrado</h2>
              <p className="text-sm text-muted-foreground">
                O código QR é inválido ou já não está ativo. Contacte o ponto de atendimento mais próximo.
              </p>
            </CardContent>
          </Card>
        )}

        {data && (
          <Card className="overflow-hidden">
            <CardHeader className={data.is_active ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {data.is_active ? (
                    <><CheckCircle2 className="h-6 w-6 text-green-600" /> Cartão Activo</>
                  ) : (
                    <><ShieldX className="h-6 w-6 text-red-600" /> Cartão Revogado</>
                  )}
                </CardTitle>
                <Badge variant="outline" className="font-mono">{data.serial}</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                {data.photo_url ? (
                  <img src={data.photo_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary/60" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h2 className="text-xl font-bold">{data.farmer_name}</h2>
                  <Badge variant="secondary">{data.farmer_type}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t">
                <InfoRow icon={MapPin} label="Localização" value={[data.province_name, data.municipality_name].filter(Boolean).join(' / ') || '—'} />
                <InfoRow icon={Sprout} label="Cultura principal" value={(data.main_crops?.[0]) || '—'} />
                <InfoRow icon={Sprout} label="Área cultivada" value={data.cultivated_area_ha ? `${data.cultivated_area_ha} ha` : '—'} />
                <InfoRow label="Versão do cartão" value={`v${data.version}`} />
              </div>

              <div className="pt-4 border-t text-xs text-muted-foreground">
                Última atualização: {format(new Date(data.updated_at), 'dd/MM/yyyy HH:mm')}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Esta verificação não expõe dados pessoais sensíveis.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />}
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
