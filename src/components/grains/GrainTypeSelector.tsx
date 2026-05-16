import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GRAIN_TYPES, type GrainType, getGrainLabel } from '@/lib/grains';
import { cn } from '@/lib/utils';

interface GrainTypeSelectorProps {
  value: GrainType | 'all';
  onChange: (v: GrainType | 'all') => void;
  className?: string;
  includeAll?: boolean;
  label?: string;
}

export function GrainTypeSelector({
  value,
  onChange,
  className,
  includeAll = true,
  label = 'Tipo de grão',
}: GrainTypeSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as GrainType | 'all')}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          {includeAll && (
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <span>🌐</span>
                <span>Todos os grãos</span>
              </span>
            </SelectItem>
          )}
          {GRAIN_TYPES.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              <span className="flex items-center gap-2">
                <span>{g.emoji}</span>
                <span>{g.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface GrainBadgeProps {
  grainType: string | null | undefined;
  className?: string;
}

export function GrainBadge({ grainType, className }: GrainBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-normal', className)}>
      {getGrainLabel(grainType)}
    </Badge>
  );
}
