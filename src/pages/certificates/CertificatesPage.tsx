import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye,
  LayoutDashboard,
  List,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useCertificates, useCertificateStats } from '@/hooks/useCertificates';
import { WorkflowStatusBadge } from '@/components/farmers/WorkflowStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#ef4444', '#f59e0b'];

const CertificatesPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  
  const farmerId = searchParams.get('farmer_id');
  
  const { data: certificates, isLoading } = useCertificates({
    status: statusFilter === 'all' ? undefined : statusFilter as any,
    year: yearFilter === 'all' ? undefined : parseInt(yearFilter),
    farmer_id: farmerId || undefined,
  });
  
  const { data: stats } = useCertificateStats();

  const filteredCertificates = certificates?.filter((cert) =>
    cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.farmers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusData = [
    { name: 'Rascunho', value: stats?.byStatus.draft || 0, icon: Clock },
    { name: 'Submetido', value: stats?.byStatus.submitted || 0, icon: AlertTriangle },
    { name: 'Validado', value: stats?.byStatus.validated || 0, icon: CheckCircle },
    { name: 'Aprovado', value: stats?.byStatus.approved || 0, icon: CheckCircle },
    { name: 'Emitido', value: stats?.byStatus.issued || 0, icon: CheckCircle },
    { name: 'Rejeitado', value: stats?.byStatus.rejected || 0, icon: XCircle },
  ];

  const typeData = Object.entries(stats?.byType || {}).map(([name, value]) => ({
    name: name === 'production' ? 'Produção' : 
          name === 'organic' ? 'Orgânico' : 
          name === 'quality' ? 'Qualidade' : 
          name === 'origin' ? 'Origem' : 'Boas Práticas',
    value
  }));

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  return (
    <MainLayout title="Certificados de Produção" subtitle="Emissão e gestão de certificados agrícolas">
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Emitidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats?.byStatus.issued || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">
                  {(stats?.byStatus.draft || 0) + (stats?.byStatus.submitted || 0) + (stats?.byStatus.validated || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejeitados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats?.byStatus.rejected || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={typeData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por número ou agricultor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="submitted">Submetido</SelectItem>
                  <SelectItem value="validated">Validado</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="issued">Emitido</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Link to="/certificados/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Certificado
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certificados ({filteredCertificates?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Agricultor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Culturas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum certificado encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCertificates?.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">
                            {cert.certificate_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{cert.farmers?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {cert.farmers?.registration_number}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {cert.certificate_type === 'production' ? 'Produção' : 
                               cert.certificate_type === 'organic' ? 'Orgânico' : 
                               cert.certificate_type === 'quality' ? 'Qualidade' : 
                               cert.certificate_type === 'origin' ? 'Origem' : 'Boas Práticas'}
                            </Badge>
                          </TableCell>
                          <TableCell>{cert.year}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {cert.crops?.slice(0, 2).map((crop) => (
                                <Badge key={crop} variant="secondary" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                              {cert.crops?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{cert.crops.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <WorkflowStatusBadge status={cert.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/certificados/${cert.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default CertificatesPage;
