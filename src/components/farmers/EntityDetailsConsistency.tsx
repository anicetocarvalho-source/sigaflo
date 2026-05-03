import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Discrepancy {
  label: string;
  declared: number | null | undefined;
  computed: number;
  unit?: string;
  tolerance?: number; // absolute tolerance
}

interface Props {
  farmerId: string;
  farmerType: 'cooperative' | 'field_school';
  hasDetails: boolean;
  isLoading?: boolean;
  discrepancies?: Discrepancy[];
}

const fmt = (v: number | null | undefined, unit?: string) => {
  if (v == null) return '—';
  const s = Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 2 });
  return unit ? `${s} ${unit}` : s;
};

export const EntityDetailsConsistency = ({ farmerId, farmerType, hasDetails, isLoading, discrepancies = [] }: Props) => {
  if (isLoading) return null;

  const editPath = farmerType === 'cooperative'
    ? `/agricultores/cooperativas/${farmerId}/editar`
    : `/agricultores/escolas/${farmerId}/editar`;

  if (!hasDetails) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Detalhes específicos por preencher</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Esta {farmerType === 'cooperative' ? 'cooperativa' : 'escola de campo'} não tem informações dedicadas registadas.
            Os totais apresentados são apenas calculados a partir dos membros associados e podem estar incompletos.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link to={editPath}>Preencher detalhes</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Filter actual mismatches (only when both sides are known)
  const issues = discrepancies.filter((d) => {
    if (d.declared == null) return false;
    const tol = d.tolerance ?? 0;
    return Math.abs(Number(d.declared) - Number(d.computed)) > tol;
  });

  if (issues.length === 0) {
    return (
      <Alert className="border-emerald-500/40 bg-emerald-500/5">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertTitle>Dados consistentes</AlertTitle>
        <AlertDescription>
          Os totais declarados coincidem com os valores calculados a partir dos membros e parcelas associados.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Inconsistências detectadas</AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-sm">
          Os valores declarados nos detalhes não coincidem com os valores calculados a partir dos membros / parcelas:
        </p>
        <ul className="text-sm list-disc pl-5 space-y-1">
          {issues.map((d) => (
            <li key={d.label}>
              <strong>{d.label}:</strong> declarado {fmt(d.declared, d.unit)} · calculado {fmt(d.computed, d.unit)}
            </li>
          ))}
        </ul>
        <Button asChild size="sm" variant="outline" className="mt-2">
          <Link to={editPath}>Rever e corrigir</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};
