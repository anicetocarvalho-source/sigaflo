import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDataExports } from '@/hooks/useDataLab';
import { Download, FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function ExportsManager() {
  const { data: exports, isLoading } = useDataExports();

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'json': return <FileJson className="h-4 w-4 text-yellow-500" />;
      case 'csv': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Registo de Exportações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Datasets</TableHead>
                <TableHead>Registos</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Propósito</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando exportações...
                  </TableCell>
                </TableRow>
              ) : exports?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma exportação registada
                  </TableCell>
                </TableRow>
              ) : (
                exports?.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(exp.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFormatIcon(exp.export_format)}
                        <span className="uppercase font-mono text-sm">{exp.export_format}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {exp.dataset_ids?.slice(0, 2).map((ds) => (
                          <Badge key={ds} variant="outline" className="text-xs">
                            {ds}
                          </Badge>
                        ))}
                        {(exp.dataset_ids?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(exp.dataset_ids?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{exp.row_count?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{formatFileSize(exp.file_size_bytes)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {exp.purpose || '-'}
                    </TableCell>
                    <TableCell>
                      {exp.downloaded_at ? (
                        <Badge variant="secondary">Baixado</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        {exports && exports.length > 0 && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{exports.length}</p>
              <p className="text-sm text-muted-foreground">Total Exportações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {exports.reduce((sum, e) => sum + (e.row_count || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Registos Exportados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatFileSize(exports.reduce((sum, e) => sum + (e.file_size_bytes || 0), 0))}
              </p>
              <p className="text-sm text-muted-foreground">Volume Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {exports.filter(e => e.downloaded_at).length}
              </p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
