import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Leaf, Droplets, Package } from 'lucide-react';
import { getAgronomicRecommendation, type AgronomicInput } from '@/lib/agronomicRules';

interface Props {
  mainCrops?: string[];
  province?: string;
  areaHa?: number;
}

export const FarmerForecast = ({ mainCrops, province, areaHa }: Props) => {
  const crops = mainCrops?.length ? mainCrops : ['Milho'];
  
  const recommendations = crops.map(crop => {
    const input: AgronomicInput = {
      crop,
      province: province || 'Luanda',
      areaHa: areaHa || 1,
    };
    return { crop, ...getAgronomicRecommendation(input) };
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Plano Técnico Agronómico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Recomendações técnicas baseadas na cultura, zona agro-ecológica e área cultivada.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cultura</TableHead>
                <TableHead>Rendimento Est.</TableHead>
                <TableHead>Sementeira</TableHead>
                <TableHead>Fertilização</TableHead>
                <TableHead>Irrigação</TableHead>
                <TableHead>Pacote Recomendado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map(r => (
                <TableRow key={r.crop}>
                  <TableCell>
                    <Badge variant="secondary"><Leaf className="mr-1 h-3 w-3" />{r.crop}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.expectedYield}</TableCell>
                  <TableCell className="text-sm">{r.plantingWindow}</TableCell>
                  <TableCell className="text-sm">{r.fertilization}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Droplets className="h-3 w-3" />{r.irrigation}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Package className="mr-1 h-3 w-3" />{r.recommendedPackage}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes Técnicos — {recommendations[0].crop}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Espaçamento</p>
              <p className="font-medium">{recommendations[0].spacing}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ciclo</p>
              <p className="font-medium">{recommendations[0].cycleDays} dias</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pragas Principais</p>
              <p className="font-medium">{recommendations[0].mainPests}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doenças Principais</p>
              <p className="font-medium">{recommendations[0].mainDiseases}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
