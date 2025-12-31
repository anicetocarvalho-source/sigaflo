import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnforcementKPIs } from './EnforcementKPIs';
import { InfractionsList } from './InfractionsList';
import { InfractionForm } from './InfractionForm';
import { InfractionDetail } from './InfractionDetail';
import { EnforcementAlerts } from './EnforcementAlerts';
import { EnforcementCharts } from './EnforcementCharts';
import { EnforcementMap } from './EnforcementMap';
import { List, BarChart3, Map, Bell } from 'lucide-react';

export function EnforcementDashboard() {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInfraction, setSelectedInfraction] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch infractions
  const { data: infractions = [], isLoading: infractionsLoading } = useQuery({
    queryKey: ['forest-infractions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_infractions')
        .select(`
          *,
          province:provinces(name),
          municipality:municipalities(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate stats
  const stats = {
    totalInfractions: infractions.length,
    pendingInfractions: infractions.filter((i: any) => 
      ['detected', 'under_investigation', 'notification_sent', 'awaiting_response'].includes(i.status)
    ).length,
    resolvedInfractions: infractions.filter((i: any) => 
      ['resolved', 'archived'].includes(i.status)
    ).length,
    totalFinesAOA: infractions.reduce((sum: number, i: any) => sum + (i.fine_amount_aoa || 0), 0),
    activeInspections: infractions.filter((i: any) => i.status === 'under_investigation').length,
    seizures: infractions.filter((i: any) => i.seized_volume_m3 && i.seized_volume_m3 > 0).length,
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('forest_infractions')
        .insert({
          ...data,
          status: 'detected',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-infractions'] });
      toast.success('Infração registada com sucesso');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao registar infração: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('forest_infractions')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-infractions'] });
      toast.success('Infração actualizada com sucesso');
      setShowForm(false);
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao actualizar infração: ' + error.message);
    },
  });

  const handleAddNew = () => {
    setSelectedInfraction(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleView = (infraction: any) => {
    setSelectedInfraction(infraction);
    setShowDetail(true);
  };

  const handleEdit = (infraction: any) => {
    setSelectedInfraction(infraction);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    if (isEditing && selectedInfraction) {
      await updateMutation.mutateAsync({ ...data, id: selectedInfraction.id });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  // Prepare chart data
  const infractionsByType = Object.entries(
    infractions.reduce((acc: any, i: any) => {
      acc[i.infraction_type] = (acc[i.infraction_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count: count as number }));

  const infractionsBySeverity = Object.entries(
    infractions.reduce((acc: any, i: any) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([severity, count]) => ({ severity, count: count as number }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <EnforcementKPIs stats={stats} isLoading={infractionsLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Infrações
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            Mapa
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <InfractionsList
            infractions={infractions.map((i: any) => ({
              ...i,
              operator_name: i.offender_name || '',
            }))}
            isLoading={infractionsLoading}
            onAddNew={handleAddNew}
            onView={handleView}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <EnforcementMap infractions={infractions} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <EnforcementCharts
            infractionsByType={infractionsByType}
            infractionsBySeverity={infractionsBySeverity}
            infractionsByMonth={[]}
            infractionsByProvince={[]}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <EnforcementAlerts alerts={[]} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <InfractionForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setIsEditing(false);
          setSelectedInfraction(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedInfraction}
        isEdit={isEditing}
      />

      {/* Detail Dialog */}
      <InfractionDetail
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedInfraction(null);
        }}
        infraction={selectedInfraction}
        onEdit={() => {
          setShowDetail(false);
          handleEdit(selectedInfraction);
        }}
      />
    </div>
  );
}
