import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowUpRight, Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { evaluateEligibility } from '@/lib/cardEligibility';
import type { Farmer } from '@/hooks/useFarmers';

interface Props {
  farmer: Farmer;
  card?: { card_status?: string | null; delivered_at?: string | null; printed_at?: string | null } | null;
  compact?: boolean;
}

export function CardEligibilityPanel({ farmer, card, compact }: Props) {
  const report = evaluateEligibility(farmer, card);
  const pct = Math.round((report.unlockedCount / report.totalCount) * 100);

  return (
    <Card className={compact ? 'border-dashed' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Módulos desbloqueados pelo cartão
          </CardTitle>
          <Badge variant={report.unlockedCount === report.totalCount ? 'default' : 'secondary'}>
            {report.unlockedCount}/{report.totalCount}
          </Badge>
        </div>
        <Progress value={pct} className="h-1.5 mt-2" />
        {!report.hasActiveCard && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Sem cartão activo — emita o cartão para desbloquear módulos.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {report.checks.map((c) => (
          <div
            key={c.module}
            className={`flex items-start gap-2 rounded-md border p-2.5 transition-colors ${
              c.eligible ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/40'
                          : 'bg-muted/30'
            }`}
          >
            {c.eligible
              ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              : <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{c.label}</span>
                <Badge
                  variant={c.eligible ? 'default' : 'outline'}
                  className={`text-[10px] ${c.eligible ? '' : 'text-muted-foreground'}`}
                >
                  {c.eligible ? 'Desbloqueado' : 'Bloqueado'}
                </Badge>
              </div>
              <p className={`text-xs mt-0.5 ${c.eligible ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                {c.reason}
              </p>
            </div>
            {c.eligible && c.route && (
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 shrink-0">
                <Link to={c.route}>
                  Abrir <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
