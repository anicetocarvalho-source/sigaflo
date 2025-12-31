import { cn } from '@/lib/utils';

interface ReputationScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ReputationScore({ score, size = 'md', showLabel = true }: ReputationScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    if (score >= 20) return 'Baixo';
    return 'Crítico';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold',
          sizeClasses[size],
          getScoreColor(score)
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn('font-medium', getScoreColor(score).split(' ')[0])}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

interface ScoreBreakdownProps {
  production: number;
  compliance: number;
  certification: number;
  overall: number;
}

export function ScoreBreakdown({ production, compliance, certification, overall }: ScoreBreakdownProps) {
  const scores = [
    { label: 'Produção', value: production, weight: '40%' },
    { label: 'Conformidade', value: compliance, weight: '35%' },
    { label: 'Certificação', value: certification, weight: '25%' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Score Global</span>
        <ReputationScore score={overall} size="lg" />
      </div>
      
      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{s.label}</span>
              <span className="text-muted-foreground">({s.weight})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    s.value >= 80 ? 'bg-green-500' :
                    s.value >= 60 ? 'bg-blue-500' :
                    s.value >= 40 ? 'bg-yellow-500' :
                    s.value >= 20 ? 'bg-orange-500' : 'bg-red-500'
                  )}
                  style={{ width: `${s.value}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
