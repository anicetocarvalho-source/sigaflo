import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, AlertCircle, Loader2, ChevronDown, FileText, Info, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  useCardExportJobs,
  useCardExportJobLogs,
  useRealtimeJobLogs,
  type CardExportJob,
} from '@/hooks/useCardExportJobs';

const STATUS_VARIANT: Record<CardExportJob['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; tone: string }> = {
  pending: { label: 'Pendente', variant: 'outline', icon: Loader2, tone: 'text-muted-foreground' },
  processing: { label: 'A processar', variant: 'secondary', icon: Loader2, tone: 'text-blue-600' },
  done: { label: 'Concluído', variant: 'default', icon: CheckCircle2, tone: 'text-green-600' },
  error: { label: 'Erro', variant: 'destructive', icon: AlertCircle, tone: 'text-destructive' },
};

export default function CardExportJobsPanel() {
  const { data: jobs = [], isLoading } = useCardExportJobs(15);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5" />
          Histórico de Exportações em Lote
          <Badge variant="outline" className="ml-2 font-normal">{jobs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <div className="text-sm text-muted-foreground">A carregar...</div>}
        {!isLoading && jobs.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-6">
            Sem execuções registadas. As gerações em lote (&gt;500 cartões) aparecerão aqui.
          </div>
        )}
        {jobs.map((job) => <JobItem key={job.id} job={job} />)}
      </CardContent>
    </Card>
  );
}

function JobItem({ job }: { job: CardExportJob }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_VARIANT[job.status];
  const Icon = meta.icon;
  const pct = job.total ? Math.round((job.processed / job.total) * 100) : 0;
  const isActive = job.status === 'processing' || job.status === 'pending';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border rounded-lg p-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.tone} ${isActive ? 'animate-spin' : ''}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={meta.variant}>{meta.label}</Badge>
                <span className="text-xs text-muted-foreground font-mono">#{job.id.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(job.created_at), { locale: pt, addSuffix: true })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(job.created_at), 'dd/MM/yyyy HH:mm')}
                {job.finished_at && job.started_at && (
                  <> · duração {Math.round((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s</>
                )}
              </div>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>

        <Progress value={pct} className="h-2" />

        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex gap-3">
            <span className="text-muted-foreground">Processados <strong className="text-foreground">{job.processed}</strong>/{job.total}</span>
            <span className="text-green-600">✓ {job.succeeded}</span>
            <span className="text-destructive">✗ {job.failed}</span>
          </div>
          <span className="text-muted-foreground">{pct}%</span>
        </div>

        {job.error_message && (
          <div className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
            {job.error_message}
          </div>
        )}

        <CollapsibleContent>
          <JobLogs jobId={job.id} />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function JobLogs({ jobId }: { jobId: string }) {
  useRealtimeJobLogs(jobId);
  const { data: logs = [], isLoading } = useCardExportJobLogs(jobId);

  if (isLoading) return <div className="text-xs text-muted-foreground py-2">A carregar logs...</div>;
  if (!logs.length) return <div className="text-xs text-muted-foreground py-2">Sem logs registados.</div>;

  return (
    <ScrollArea className="h-56 mt-2 border rounded bg-muted/30">
      <div className="p-2 space-y-1 font-mono text-xs">
        {logs.map((l) => {
          const ico = l.level === 'error' ? AlertCircle : l.level === 'warning' ? AlertTriangle : Info;
          const Icon = ico;
          const color = l.level === 'error' ? 'text-destructive' : l.level === 'warning' ? 'text-amber-600' : 'text-muted-foreground';
          return (
            <div key={l.id} className="flex items-start gap-2">
              <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${color}`} />
              <span className="text-muted-foreground shrink-0">{format(new Date(l.created_at), 'HH:mm:ss')}</span>
              <span className={`flex-1 break-words ${color}`}>{l.message}</span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
