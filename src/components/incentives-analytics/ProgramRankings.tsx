import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingDown, 
  TrendingUp,
  Users,
  Coins
} from 'lucide-react';
import { ProgramRanking } from '@/hooks/useIncentivesAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProgramRankingsProps {
  data?: {
    mostEffective: ProgramRanking[];
    leastEffective: ProgramRanking[];
  };
  isLoading: boolean;
}

export function ProgramRankings({ data, isLoading }: ProgramRankingsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getSectorBadge = (sector: string) => {
    const colors: Record<string, string> = {
      agriculture: 'bg-green-100 text-green-800',
      forestry: 'bg-emerald-100 text-emerald-800',
      coffee: 'bg-amber-100 text-amber-800',
      rice: 'bg-blue-100 text-blue-800'
    };
    const labels: Record<string, string> = {
      agriculture: 'Agricultura',
      forestry: 'Florestal',
      coffee: 'Café',
      rice: 'Arroz'
    };
    return (
      <Badge className={colors[sector] || 'bg-gray-100 text-gray-800'}>
        {labels[sector] || sector}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-100 text-green-800">{score}</Badge>;
    if (score >= 40) return <Badge className="bg-amber-100 text-amber-800">{score}</Badge>;
    return <Badge className="bg-red-100 text-red-800">{score}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Effective Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Trophy className="h-5 w-5" />
            Programas Mais Eficazes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.mostEffective?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sem dados de rankings</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Impacto</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.mostEffective.map((program, index) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-600 text-amber-100' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{program.name}</p>
                        <p className="text-xs text-muted-foreground">{program.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getSectorBadge(program.sector)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">+{program.productionIncrease}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getScoreBadge(program.effectivenessScore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Least Effective Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingDown className="h-5 w-5" />
            Programas com Menor Retorno
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.leastEffective?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sem dados de rankings</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Investido</TableHead>
                  <TableHead className="text-right">Impacto</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leastEffective.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{program.name}</p>
                        <p className="text-xs text-muted-foreground">{program.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getSectorBadge(program.sector)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatCurrency(program.invested)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 ${
                        program.productionIncrease >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {program.productionIncrease >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {program.productionIncrease >= 0 ? '+' : ''}{program.productionIncrease}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getScoreBadge(program.effectivenessScore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
