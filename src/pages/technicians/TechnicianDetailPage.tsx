import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MapPin, Phone, Mail, UserPlus, UserMinus, Briefcase, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useAuth } from '@/contexts/AuthContext';
import { AssignFarmersDialog } from '@/components/technicians/AssignFarmersDialog';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function TechnicianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { technicians, isLoading, assignFarmers, unassignFarmers, useTechnicianFarmers } = useTechnicians();
  const { isAdmin } = useAuth();
  const [showAssign, setShowAssign] = useState(false);
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

  const tech = technicians.find(t => t.id === id);
  const farmersQuery = useTechnicianFarmers(id || null);
  const farmers = farmersQuery.data || [];

  if (isLoading) {
    return <MainLayout title="Técnico de Campo"><div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div></MainLayout>;
  }

  if (!tech) {
    return <MainLayout title="Técnico de Campo"><div className="flex items-center justify-center h-64 text-muted-foreground">Técnico não encontrado</div></MainLayout>;
  }

  const toggleFarmer = (id: string) => {
    setSelectedFarmers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleUnassign = () => {
    if (selectedFarmers.length === 0) return;
    if (!confirm(`Desvincular ${selectedFarmers.length} agricultor(es)?`)) return;
    unassignFarmers.mutate(selectedFarmers, {
      onSuccess: () => setSelectedFarmers([]),
    });
  };

  const typeLabels: Record<string, string> = {
    individual: 'Individual',
    family: 'Familiar',
    company: 'Empresa',
  };

  return (
    <MainLayout title="Técnico de Campo" subtitle={tech.full_name}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/tecnicos')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{tech.full_name}</h1>
                  <p className="text-sm text-muted-foreground font-mono">{tech.employee_number}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {tech.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{tech.phone}</span>}
                    {tech.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{tech.email}</span>}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {(tech.provinces as any)?.name || '—'}
                      {(tech.municipalities as any)?.name ? ` / ${(tech.municipalities as any).name}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className={tech.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {tech.status === 'active' ? 'Activo' : tech.status === 'on_leave' ? 'Em Licença' : 'Inactivo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Agricultores Atribuídos</p>
              <p className="text-2xl font-bold">{farmers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Capacidade Máxima</p>
              <p className="text-2xl font-bold">{tech.max_farmers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
              <p className="text-2xl font-bold">{Math.max(0, tech.max_farmers - farmers.length)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Farmers list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Agricultores Atribuídos ({farmers.length})
            </CardTitle>
            <div className="flex gap-2">
              {isAdmin && selectedFarmers.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleUnassign} disabled={unassignFarmers.isPending}>
                  <UserMinus className="h-4 w-4 mr-1" /> Desvincular ({selectedFarmers.length})
                </Button>
              )}
              {isAdmin && (
                <Button size="sm" onClick={() => setShowAssign(true)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Atribuir
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead className="w-10"></TableHead>}
                  <TableHead>Nº Registo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Província</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmersQuery.isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                ) : farmers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum agricultor atribuído</TableCell></TableRow>
                ) : farmers.map((farmer: any) => (
                  <TableRow key={farmer.id}>
                    {isAdmin && (
                      <TableCell>
                        <Checkbox checked={selectedFarmers.includes(farmer.id)} onCheckedChange={() => toggleFarmer(farmer.id)} />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs">{farmer.registration_number}</TableCell>
                    <TableCell>
                      <Link to={`/agricultores/${farmer.id}`} className="text-primary hover:underline font-medium">
                        {farmer.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{typeLabels[farmer.farmer_type] || farmer.farmer_type}</Badge>
                    </TableCell>
                    <TableCell>{(farmer.provinces as any)?.name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showAssign && (
        <AssignFarmersDialog
          open={showAssign}
          onOpenChange={setShowAssign}
          technicianId={tech.id}
          technicianName={tech.full_name}
          onAssign={(farmerIds) => {
            assignFarmers.mutate({ technicianId: tech.id, farmerIds }, {
              onSuccess: () => setShowAssign(false),
            });
          }}
          isAssigning={assignFarmers.isPending}
        />
      )}
    </MainLayout>
  );
}
