import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Wheat, ArrowRight, Package, ShoppingCart, DollarSign, Filter, X } from 'lucide-react';
import { useGrainsOverview } from '@/hooks/useRice';
import { GRAIN_TYPES, getGrainLabel, type GrainType } from '@/lib/grains';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Todos os valores de produção/importação vêm da base em TONELADAS (unidade padronizada).
const TON_TO_KG = 1000;

const fmt = (n: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('pt-AO');
};

// Formata um valor em toneladas mostrando também o equivalente em kg.
const formatTonnes = (tonnes: number) => {
  const abs = Math.abs(tonnes);
  const kg = abs * TON_TO_KG;
  const kgLabel = kg >= 1_000_000
    ? `${(kg / 1_000_000).toFixed(2)} M kg`
    : `${kg.toLocaleString('pt-AO')} kg`;
  return { ton: `${fmt(abs)} t`, kg: kgLabel };
};

export function GrainsOverview() {
  const { data, isLoading } = useGrainsOverview();
  const byGrain = data || {};

  const rows = GRAIN_TYPES.map((g) => {
    const b = byGrain[g.value] || { production: 0, area: 0, imports: 0, importValue: 0, avgPrice: 0, priceSamples: 0 };
    const balance = b.production - b.imports;
    return { ...g, ...b, balance };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      production: acc.production + r.production,
      imports: acc.imports + r.imports,
      area: acc.area + r.area,
    }),
    { production: 0, imports: 0, area: 0 },
  );

  const activeGrains = rows.filter((r) => r.production > 0 || r.imports > 0).length;

  return (
    <div className="card-elevated overflow-hidden">
      <div className="gradient-primary p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-foreground/10 p-2">
              <Wheat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-primary-foreground">
                Visão Multi-Grão
              </h3>
              <p className="mt-0.5 text-sm text-primary-foreground/80">
                Comparativo agregado por tipo de cereal — {activeGrains}/{GRAIN_TYPES.length} grãos com dados
              </p>
            </div>
          </div>
          <div className="hidden gap-4 md:flex">
            <Metric label="Produção total" value={`${fmt(totals.production)} t`} icon={Package} />
            <Metric label="Importações totais" value={`${fmt(totals.imports)} t`} icon={ShoppingCart} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            A carregar agregados multi-grão...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Grão</th>
                <th className="px-4 py-2 text-right font-medium">Produção (t)</th>
                <th className="px-4 py-2 text-right font-medium">Área (ha)</th>
                <th className="px-4 py-2 text-right font-medium">Importações (t)</th>
                <th className="px-4 py-2 text-right font-medium">Preço médio (AOA/kg)</th>
                <th className="px-4 py-2 text-right font-medium">Balanço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const hasData = r.production > 0 || r.imports > 0 || r.priceSamples > 0;
                return (
                  <tr key={r.value} className={cn('hover:bg-muted/30', !hasData && 'opacity-50')}>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <span>{r.emoji}</span>
                        <span>{getGrainLabel(r.value as GrainType)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.production)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmt(r.area)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.imports)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {r.avgPrice > 0 ? r.avgPrice.toFixed(0) : '—'}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right font-medium tabular-nums',
                        r.balance > 0 ? 'text-success' : r.balance < 0 ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {r.balance === 0 ? (
                        '—'
                      ) : (() => {
                        const { ton, kg } = formatTonnes(r.balance);
                        const sign = r.balance > 0 ? '+' : '−';
                        return (
                          <div className="flex flex-col items-end leading-tight">
                            <span>{sign}{ton}</span>
                            <span className="text-[10px] font-normal text-muted-foreground">{sign}{kg}</span>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 text-accent" />
          <span>Balanço positivo indica auto-suficiência face às importações registadas</span>
        </div>
        <Link to="/arroz" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Abrir módulo de Grãos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-1.5">
      <Icon className="h-4 w-4 text-primary-foreground" />
      <div className="leading-tight">
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">{label}</p>
        <p className="text-sm font-semibold text-primary-foreground">{value}</p>
      </div>
    </div>
  );
}
