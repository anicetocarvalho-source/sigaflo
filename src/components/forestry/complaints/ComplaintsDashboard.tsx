import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ComplaintsKPIs } from './ComplaintsKPIs';
import { ComplaintsList } from './ComplaintsList';
import { ComplaintForm } from './ComplaintForm';
import { ComplaintDetail } from './ComplaintDetail';
import { ComplaintsCharts } from './ComplaintsCharts';
import { List, BarChart3, Megaphone } from 'lucide-react';

export function ComplaintsDashboard() {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  
  const queryClient = useQueryClient();

  // Fetch complaints
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['forest-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_complaints')
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
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter((c: any) => c.status === 'received').length,
    underInvestigation: complaints.filter((c: any) => 
      ['under_review', 'under_investigation'].includes(c.status)
    ).length,
    resolvedComplaints: complaints.filter((c: any) => c.status === 'resolved').length,
    verifiedComplaints: complaints.filter((c: any) => c.verification_result === 'confirmed').length,
    anonymousComplaints: complaints.filter((c: any) => c.is_anonymous).length,
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('forest_complaints')
        .insert({
          ...data,
          status: 'received',
          received_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-complaints'] });
      toast.success('Denúncia submetida com sucesso');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao submeter denúncia: ' + error.message);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const updateData: any = { status };
      if (notes) {
        updateData.investigation_notes = notes;
      }
      if (status === 'verified') {
        updateData.verification_result = 'confirmed';
        updateData.verified_at = new Date().toISOString();
      } else if (status === 'unverified') {
        updateData.verification_result = 'unconfirmed';
        updateData.verified_at = new Date().toISOString();
      } else if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('forest_complaints')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-complaints'] });
      toast.success('Estado actualizado com sucesso');
      setShowDetail(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao actualizar estado: ' + error.message);
    },
  });

  const handleAddNew = () => {
    setShowForm(true);
  };

  const handleView = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowDetail(true);
  };

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdateStatus = (status: string, notes: string) => {
    if (selectedComplaint) {
      updateStatusMutation.mutate({ id: selectedComplaint.id, status, notes });
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <ComplaintsKPIs stats={stats} isLoading={isLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Denúncias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <ComplaintsList
            complaints={complaints}
            isLoading={isLoading}
            onAddNew={handleAddNew}
            onView={handleView}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <ComplaintsCharts
            complaintsByType={[]}
            complaintsByStatus={[]}
            complaintsByMonth={[]}
            complaintsByProvince={[]}
          />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <ComplaintForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
      />

      {/* Detail Dialog */}
      <ComplaintDetail
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
