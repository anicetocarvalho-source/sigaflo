import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ReforestationKPIs } from './ReforestationKPIs';
import { ProjectsList } from './ProjectsList';
import { ProjectForm } from './ProjectForm';
import { ReforestationAlerts } from './ReforestationAlerts';
import { ReforestationCharts } from './ReforestationCharts';
import { NurseriesManager } from './NurseriesManager';
import { List, BarChart3, Sprout, Bell } from 'lucide-react';

export function ReforestationDashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for reforestation projects (table doesn't exist yet)
  const projects: any[] = [
    {
      id: '1',
      project_name: 'Reflorestamento Maiombe',
      project_code: 'REF-2024-001',
      status: 'planting',
      target_area_ha: 500,
      planted_area_ha: 320,
      target_trees: 50000,
      planted_trees: 32000,
      survival_rate: 78,
      start_date: '2024-01-15',
      implementing_entity: 'IDF',
      province: { name: 'Cabinda' },
    },
    {
      id: '2',
      project_name: 'Floresta Comunitária Uíge',
      project_code: 'REF-2024-002',
      status: 'monitoring',
      target_area_ha: 200,
      planted_area_ha: 200,
      target_trees: 20000,
      planted_trees: 20000,
      survival_rate: 82,
      start_date: '2023-06-01',
      implementing_entity: 'ONG Verde',
      province: { name: 'Uíge' },
    },
    {
      id: '3',
      project_name: 'Restauração Zaire Norte',
      project_code: 'REF-2024-003',
      status: 'planning',
      target_area_ha: 350,
      planted_area_ha: 0,
      target_trees: 35000,
      planted_trees: 0,
      survival_rate: null,
      start_date: '2024-06-01',
      implementing_entity: 'MINAMB',
      province: { name: 'Zaire' },
    },
  ];
  const projectsLoading = false;

  // Calculate stats
  const stats = {
    totalPrograms: projects.length,
    activePrograms: projects.filter((p: any) => 
      ['planting', 'monitoring', 'maintenance'].includes(p.status)
    ).length,
    totalAreaHa: projects.reduce((sum: number, p: any) => sum + (p.planted_area_ha || 0), 0),
    plantedTrees: projects.reduce((sum: number, p: any) => sum + (p.planted_trees || 0), 0),
    survivalRate: projects.length > 0 
      ? Math.round(projects.reduce((sum: number, p: any) => sum + (p.survival_rate || 0), 0) / projects.filter((p: any) => p.survival_rate).length) || 0
      : 0,
    nurseryStock: 53200, // Mock - would come from nurseries table
  };

  const handleAddNew = () => {
    setSelectedProject(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleView = (project: any) => {
    setSelectedProject(project);
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    toast.success(isEditing ? 'Projecto actualizado com sucesso' : 'Projecto criado com sucesso');
    setShowForm(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <ReforestationKPIs stats={stats} isLoading={projectsLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <List className="h-4 w-4" />
            Projectos
          </TabsTrigger>
          <TabsTrigger value="nurseries" className="gap-2">
            <Sprout className="h-4 w-4" />
            Viveiros
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

        <TabsContent value="projects" className="mt-4">
          <ProjectsList
            projects={projects.map((p: any) => ({
              ...p,
              project_code: p.project_code || `REF-${p.id.slice(0, 6).toUpperCase()}`,
            }))}
            isLoading={projectsLoading}
            onAddNew={handleAddNew}
            onView={handleView}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="nurseries" className="mt-4">
          <NurseriesManager />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <ReforestationCharts
            projectsByType={[]}
            projectsByProvince={[]}
            progressByMonth={[]}
            survivalBySpecies={[]}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <ReforestationAlerts alerts={[]} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <ProjectForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setIsEditing(false);
          setSelectedProject(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedProject}
        isEdit={isEditing}
      />
    </div>
  );
}
