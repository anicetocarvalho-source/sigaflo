import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldX, MapPin, Sprout, User, AlertTriangle, Clock, ShieldQuestion } from 'lucide-react';
import { useCardVerification, useCardVerificationByCode } from '@/hooks/useFarmerCards';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInYears, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useMemo } from 'react';
import { qrTokenSchema, anyCardCodeSchema } from '@/lib/cardCodes';

// Cartão válido por 5 anos a partir da emissão
const CARD_VALIDITY_YEARS = 5;

type VerificationStatus = 'invalid_token' | 'not_found' | 'revoked' | 'expired' | 'valid';

interface StatusMeta {
  status: VerificationStatus;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  tone: 'success' | 'destructive' | 'warning' | 'muted';
}

const toneStyles: Record<StatusMeta['tone'], { header: string; iconColor: string; badge: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  success: { header: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600', badge: 'default' },
  destructive: { header: 'bg-red-50 dark:bg-red-950/30', iconColor: 'text-red-600', badge: 'destructive' },
  warning: { header: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600', badge: 'secondary' },
  muted: { header: 'bg-muted', iconColor: 'text-muted-foreground', badge: 'outline' },
};

export default function CardVerificationPage() {
  const { token, code } = useParams<{ token?: string; code?: string }>();
  // Modo `:token` aceita apenas tokens QR; modo `:code` aceita token, serial ou registo.
  const tokenParse = token ? qrTokenSchema.safeParse(token) : null;
  const codeParse = code ? anyCardCodeSchema.safeParse(code) : null;
  const tokenIsValid = !!tokenParse?.success;
  const codeIsValid = !!codeParse?.success;
  const inputIsValid = !!token ? tokenIsValid : codeIsValid;

  const tokenQuery = useCardVerification(tokenIsValid ? tokenParse!.data : undefined);
  const codeQuery = useCardVerificationByCode(codeIsValid ? codeParse!.data : undefined);
  const { data, isLoading, error } = token ? tokenQuery : codeQuery;

  const meta: StatusMeta | null = useMemo(() => {
    if (!tokenIsValid) {
      return {
        status: 'invalid_token',
        label: 'Token inválido',
        description: 'O link de verificação não tem o formato esperado.',
        icon: ShieldQuestion,
        tone: 'muted',
      };
    }
    if (isLoading) return null;
    if (error || !data) {
      return {
        status: 'not_found',
        label: 'Cartão não encontrado',
        description: 'Este código QR não corresponde a nenhum cartão emitido pelo SIGAFLO.',
        icon: AlertTriangle,
        tone: 'destructive',
      };
    }
    if (data.card_status === 'revogado' || data.is_active === false) {
      return {
        status: 'revoked',
        label: 'Cartão revogado',
        description: 'Este cartão foi revogado e já não é válido. Contacte o ponto de atendimento mais próximo.',
        icon: ShieldX,
        tone: 'destructive',
      };
    }
    if (data.issued_at) {
      const yrs = differenceInYears(new Date(), new Date(data.issued_at));
      if (yrs >= CARD_VALIDITY_YEARS) {
        return {
          status: 'expired',
          label: 'Cartão expirado',
          description: `Cartão emitido há ${yrs} anos. Validade máxima: ${CARD_VALIDITY_YEARS} anos.`,
          icon: Clock,
          tone: 'warning',
        };
      }
    }
    return {
      status: 'valid',
      label: 'Cartão válido',
      description: 'Cartão activo e em conformidade com o registo SIGAFLO.',
      icon: CheckCircle2,
      tone: 'success',
    };
  }, [tokenIsValid, isLoading, error, data]);

  const expiresAt = data?.issued_at
    ? new Date(new Date(data.issued_at).setFullYear(new Date(data.issued_at).getFullYear() + CARD_VALIDITY_YEARS))
    : null;

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

        {!isLoading && meta && (meta.status === 'invalid_token' || meta.status === 'not_found') && (
          <Card className="border-destructive">
            <CardContent className="p-8 text-center space-y-3">
              <meta.icon className={`h-12 w-12 mx-auto ${toneStyles[meta.tone].iconColor}`} />
              <h2 className="text-xl font-semibold">{meta.label}</h2>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && data && meta && meta.status !== 'invalid_token' && meta.status !== 'not_found' && (
          <Card className="overflow-hidden">
            <CardHeader className={toneStyles[meta.tone].header}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="flex items-center gap-2">
                  <meta.icon className={`h-6 w-6 ${toneStyles[meta.tone].iconColor}`} />
                  {meta.label}
                </CardTitle>
                <Badge variant="outline" className="font-mono">{data.serial}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{meta.description}</p>
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
                <InfoRow
                  icon={Clock}
                  label="Emitido em"
                  value={data.issued_at ? format(new Date(data.issued_at), 'dd/MM/yyyy') : '—'}
                />
                {expiresAt && (
                  <InfoRow
                    icon={Clock}
                    label={meta.status === 'expired' ? 'Expirou em' : 'Válido até'}
                    value={`${format(expiresAt, 'dd/MM/yyyy')} (${formatDistanceToNow(expiresAt, { locale: pt, addSuffix: true })})`}
                  />
                )}
              </div>

              <div className="pt-4 border-t text-xs text-muted-foreground">
                Última atualização: {format(new Date(data.updated_at), 'dd/MM/yyyy HH:mm')}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Esta verificação não expõe dados pessoais sensíveis. SIGAFLO · República de Angola
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
