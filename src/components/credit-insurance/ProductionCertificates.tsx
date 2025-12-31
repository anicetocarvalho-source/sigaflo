import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileCheck, 
  Plus, 
  Download, 
  Eye,
  QrCode,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useProductionCertificates, useGenerateProductionCertificate } from '@/hooks/useCreditInsurance';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ProductionCertificates() {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [viewCertificate, setViewCertificate] = useState<any>(null);

  const { data: farmers } = useFarmers();
  const { data: certificates, isLoading, refetch } = useProductionCertificates();
  const generateCertificate = useGenerateProductionCertificate();

  const handleGenerate = async () => {
    if (!selectedFarmerId) {
      toast.error('Seleccione um agricultor');
      return;
    }

    try {
      await generateCertificate.mutateAsync(selectedFarmerId);
      toast.success('Certificado gerado com sucesso');
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao gerar certificado');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge className="bg-green-100 text-green-800">Emitido</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revogado</Badge>;
      case 'expired':
        return <Badge variant="outline">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-AO').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Generate Certificate */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Certificado de Histórico Produtivo</CardTitle>
          <CardDescription>
            Crie um certificado digital validado com o histórico de produção do agricultor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
              <SelectTrigger className="md:w-[400px]">
                <SelectValue placeholder="Seleccione um agricultor" />
              </SelectTrigger>
              <SelectContent>
                {farmers?.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={generateCertificate.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Gerar Certificado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Certificados Emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Produção Total</TableHead>
                  <TableHead>Produtividade Média</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Válido</TableHead>
                  <TableHead>Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : certificates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum certificado emitido</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates?.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">{cert.certificate_number}</TableCell>
                      <TableCell>{cert.period_start_year} - {cert.period_end_year}</TableCell>
                      <TableCell>{formatNumber(cert.total_production_kg)} kg</TableCell>
                      <TableCell>{formatNumber(cert.average_productivity)} kg/ha</TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        {cert.is_valid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setViewCertificate(cert)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Detail Dialog */}
      <Dialog open={!!viewCertificate} onOpenChange={() => setViewCertificate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificado de Histórico Produtivo</DialogTitle>
            <DialogDescription>
              {viewCertificate?.certificate_number}
            </DialogDescription>
          </DialogHeader>
          
          {viewCertificate && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold">REPÚBLICA DE ANGOLA</h3>
                <p className="text-sm text-muted-foreground">Ministério da Agricultura</p>
                <p className="text-sm font-medium mt-2">SIGAF - Sistema Integrado de Gestão Agrícola e Florestal</p>
              </div>

              {/* Certificate Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">{viewCertificate.period_start_year} - {viewCertificate.period_end_year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Área Produtiva</p>
                  <p className="font-medium">{viewCertificate.productive_area_ha} ha</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produção Total</p>
                  <p className="font-medium">{formatNumber(viewCertificate.total_production_kg)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produtividade Média</p>
                  <p className="font-medium">{formatNumber(viewCertificate.average_productivity)} kg/ha</p>
                </div>
              </div>

              {/* Productions */}
              <div>
                <h4 className="font-medium mb-2">Produções Certificadas</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead>Cultura</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Produção</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewCertificate.certified_productions?.map((prod: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{prod.year}</TableCell>
                          <TableCell>{prod.crop}</TableCell>
                          <TableCell>{prod.area_ha} ha</TableCell>
                          <TableCell>{formatNumber(prod.production_kg)} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Signature and QR */}
              <div className="flex justify-between items-end border-t pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assinado por</p>
                  <p className="font-medium">{viewCertificate.signed_by}</p>
                  <p className="text-xs text-muted-foreground">
                    {viewCertificate.signed_at ? new Date(viewCertificate.signed_at).toLocaleDateString('pt-AO') : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <QRCodeSVG 
                    value={viewCertificate.verification_url || viewCertificate.qr_code_data} 
                    size={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Verificar autenticidade</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewCertificate(null)}>
                  Fechar
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
