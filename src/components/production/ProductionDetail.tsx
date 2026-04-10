import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, ArrowLeft, User, Wheat, Calendar, MapPin, Scale, TrendingUp, Star, FileText, Trash2, Loader2 } from 'lucide-react';
import type { ProductionRecord } from '@/hooks/useProductionHistory';
import { useDeleteProductionRecord } from '@/hooks/useProductionHistory';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const CROP_LABELS: Record<string, string> = {
  arroz: 'Arroz',
  milho: 'Milho',
  feijao: 'Feijão',
  mandioca: 'Mandioca',
  batata_doce: 'Batata Doce',
  amendoim: 'Amendoim',
  soja: 'Soja',
  cafe: 'Café',
  horticolas: 'Hortícolas',
  outros: 'Outros',
};

const SEASON_LABELS: Record<string, string> = {
  principal: 'Campanha Principal',
  intermediaria: 'Campanha Intermédia',
  seca: 'Campanha de Seca',
};

const QUALITY_COLORS: Record<string, string> = {
  'A': 'bg-green-500',
  'B': 'bg-blue-500',
  'C': 'bg-yellow-500',
  'D': 'bg-orange-500',
  'E': 'bg-red-500',
};

interface ProductionDetailProps {
  record: ProductionRecord;
}

export const ProductionDetail = ({ record }: ProductionDetailProps) => {
  const navigate = useNavigate();
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteProductionRecord();
  const yieldVariance = record.expected_yield_kg && record.actual_yield_kg
    ? ((record.actual_yield_kg - record.expected_yield_kg) / record.expected_yield_kg) * 100
    : null;

  const handleDelete = () => {
    deleteRecord(record.id, {
      onSuccess: () => navigate('/producao'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="outline" asChild>
          <Link to="/producao">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Lista
          </Link>
        </Button>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar registo de produção?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acção é irreversível. O registo de {CROP_LABELS[record.crop_type] || record.crop_type} - {record.season} {record.year} será permanentemente eliminado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild>
            <Link to={`/producao/${record.id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                {CROP_LABELS[record.crop_type] || record.crop_type}
              </CardTitle>
              {record.quality_grade && (
                <Badge className={QUALITY_COLORS[record.quality_grade] || 'bg-gray-500'}>
                  Grau {record.quality_grade}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Agricultor</p>
                  <p className="font-medium">{record.farmers?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{record.farmers?.registration_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Campanha / Ano</p>
                  <p className="font-medium">{SEASON_LABELS[record.season] || record.season}</p>
                  <p className="text-sm text-muted-foreground">{record.year}</p>
                </div>
              </div>

              {record.farmers?.provinces && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-medium">{record.farmers.provinces.name}</p>
                    {record.farmers.municipalities && (
                      <p className="text-sm text-muted-foreground">{record.farmers.municipalities.name}</p>
                    )}
                  </div>
                </div>
              )}

              {record.harvest_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data da Colheita</p>
                    <p className="font-medium">
                      {format(new Date(record.harvest_date), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Área Plantada</p>
                  <p className="text-2xl font-bold">
                    {record.area_planted_ha?.toLocaleString('pt-AO', { maximumFractionDigits: 2 }) || '-'} ha
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Produção Real</p>
                  <p className="text-2xl font-bold">
                    {record.actual_yield_kg?.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) || '-'} kg
                  </p>
                  {record.expected_yield_kg && (
                    <p className="text-sm text-muted-foreground">
                      Esperado: {record.expected_yield_kg.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} kg
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Rendimento</p>
                  <p className="text-2xl font-bold">
                    {record.yield_per_ha?.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) || '-'} kg/ha
                  </p>
                </div>
              </div>
            </div>

            {yieldVariance !== null && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${yieldVariance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="font-medium">
                    Variação em relação ao esperado:
                  </span>
                  <Badge variant={yieldVariance >= 0 ? 'default' : 'destructive'}>
                    {yieldVariance >= 0 ? '+' : ''}{yieldVariance.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4" />
                Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.quality_grade ? (
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${QUALITY_COLORS[record.quality_grade] || 'bg-gray-500'} text-white text-2xl font-bold mb-2`}>
                    {record.quality_grade}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.quality_grade === 'A' && 'Excelente qualidade'}
                    {record.quality_grade === 'B' && 'Boa qualidade'}
                    {record.quality_grade === 'C' && 'Qualidade média'}
                    {record.quality_grade === 'D' && 'Qualidade inferior'}
                    {record.quality_grade === 'E' && 'Qualidade mínima'}
                  </p>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Não avaliado</p>
              )}
            </CardContent>
          </Card>

          {record.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em</span>
                <span>{format(new Date(record.created_at), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizado em</span>
                <span>{format(new Date(record.updated_at), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
