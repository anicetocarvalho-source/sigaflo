import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole, getRoleLabel } from '@/contexts/AuthContext';
import { useProvinces, useMunicipalities } from '@/hooks/useFarmers';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Shield, Loader2, UserPlus, X, Pencil } from 'lucide-react';
import { format } from 'date-fns';

const ALL_ROLES: UserRole[] = [
  'admin_national',
  'admin_provincial',
  'admin_municipal',
  'technician_national',
  'technician_provincial',
  'technician_municipal',
  'private_entity',
  'viewer',
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin_national: 'bg-red-500',
  admin_provincial: 'bg-orange-500',
  admin_municipal: 'bg-yellow-500',
  technician_national: 'bg-blue-500',
  technician_provincial: 'bg-cyan-500',
  technician_municipal: 'bg-teal-500',
  private_entity: 'bg-purple-500',
  viewer: 'bg-gray-500',
};

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar_url?: string;
  province_id?: string;
  municipality_id?: string;
  is_active: boolean;
  created_at: string;
  provinces?: { name: string };
  municipalities?: { name: string };
  roles: UserRole[];
}

const useUsers = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*, provinces(name), municipalities(name)')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const rolesMap = new Map<string, UserRole[]>();
      allRoles?.forEach((r: any) => {
        const existing = rolesMap.get(r.user_id) || [];
        existing.push(r.role as UserRole);
        rolesMap.set(r.user_id, existing);
      });

      return profiles?.map((p: any) => ({
        ...p,
        roles: rolesMap.get(p.id) || [],
      })) as UserWithRoles[];
    },
  });
};

const assignRoleSchema = z.object({
  user_id: z.string().min(1, 'Selecione um utilizador'),
  role: z.string().min(1, 'Selecione um papel'),
});

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
  full_name: z.string().min(2, 'Nome completo é obrigatório'),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  province_id: z.string().optional(),
  municipality_id: z.string().optional(),
  role: z.string().optional(),
});

const editUserSchema = z.object({
  full_name: z.string().min(2, 'Nome completo é obrigatório'),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  province_id: z.string().optional(),
  municipality_id: z.string().optional(),
});

type CreateUserValues = z.infer<typeof createUserSchema>;
type EditUserValues = z.infer<typeof editUserSchema>;

const UsersPage = () => {
  const { canManageRole, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useUsers();
  const { data: provinces } = useProvinces();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'create' | 'assign'>('create');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [editProvinceId, setEditProvinceId] = useState<string>('');
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);

  const { data: municipalities } = useMunicipalities(selectedProvinceId);
  const { data: editMunicipalities } = useMunicipalities(editProvinceId);

  const assignForm = useForm({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: { user_id: '', role: '' },
  });

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      position: '',
      department: '',
      province_id: '',
      municipality_id: '',
      role: '',
    },
  });

  const editForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      position: '',
      department: '',
      province_id: '',
      municipality_id: '',
    },
  });

  // Reset edit form when editing user changes
  useEffect(() => {
    if (editingUser) {
      editForm.reset({
        full_name: editingUser.full_name || '',
        phone: editingUser.phone || '',
        position: editingUser.position || '',
        department: editingUser.department || '',
        province_id: editingUser.province_id || '',
        municipality_id: editingUser.municipality_id || '',
      });
      setEditProvinceId(editingUser.province_id || '');
    }
  }, [editingUser, editForm]);

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserValues) => {
      const { data: result, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone: data.phone || undefined,
          position: data.position || undefined,
          department: data.department || undefined,
          province_id: data.province_id || undefined,
          municipality_id: data.municipality_id || undefined,
          role: data.role || undefined,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Utilizador criado com sucesso');
      setIsDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      if (error.message?.includes('already been registered')) {
        toast.error('Este email já está registado');
      } else {
        toast.error('Erro ao criar utilizador: ' + error.message);
      }
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: EditUserValues & { user_id: string }) => {
      const { data: result, error } = await supabase.functions.invoke('update-user', {
        body: {
          user_id: data.user_id,
          full_name: data.full_name,
          phone: data.phone || null,
          position: data.position || null,
          department: data.department || null,
          province_id: data.province_id || null,
          municipality_id: data.municipality_id || null,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Perfil atualizado com sucesso');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id, role, granted_by: currentUser?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Papel atribuído com sucesso');
      setIsDialogOpen(false);
      assignForm.reset();
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate')) {
        toast.error('Este utilizador já tem este papel atribuído');
      } else {
        toast.error('Erro ao atribuir papel: ' + error.message);
      }
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Papel removido');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover papel: ' + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ user_id, is_active }: { user_id: string; is_active: boolean }) => {
      const { data: result, error } = await supabase.functions.invoke('update-user', {
        body: { user_id, is_active },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success(variables.is_active ? 'Utilizador ativado' : 'Utilizador desativado');
    },
    onError: (error: any) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const filteredUsers = users?.filter((u) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.position?.toLowerCase().includes(searchLower)
    );
  });

  const availableRoles = ALL_ROLES.filter((role) => canManageRole(role));

  const handleAssignRole = (data: { user_id: string; role: string }) => {
    assignRoleMutation.mutate({ user_id: data.user_id, role: data.role as UserRole });
  };

  const handleCreateUser = (data: CreateUserValues) => {
    createUserMutation.mutate(data);
  };

  const handleEditUser = (data: EditUserValues) => {
    if (!editingUser) return;
    updateUserMutation.mutate({ ...data, user_id: editingUser.id });
  };

  const openEditDialog = (user: UserWithRoles) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <MainLayout title="Gestão de Utilizadores" subtitle="Administrar utilizadores e papéis do sistema">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar utilizadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Gestão de Utilizadores</DialogTitle>
              </DialogHeader>
              <Tabs value={dialogTab} onValueChange={(v) => setDialogTab(v as 'create' | 'assign')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Criar Novo
                  </TabsTrigger>
                  <TabsTrigger value="assign" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Atribuir Papel
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-4">
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Nome Completo *</FormLabel>
                              <FormControl>
                                <Input placeholder="João Silva" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="email@exemplo.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Palavra-passe *</FormLabel>
                              <FormControl>
                                <Input placeholder="••••••••" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="+244 923 456 789" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo</FormLabel>
                              <FormControl>
                                <Input placeholder="Técnico Agrícola" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <FormControl>
                                <Input placeholder="Direcção Provincial" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Papel Inicial</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um papel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableRoles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {getRoleLabel(role)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="province_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Província</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedProvinceId(value);
                                  createForm.setValue('municipality_id', '');
                                }} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {provinces?.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="municipality_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Município</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvinceId}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {municipalities?.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createUserMutation.isPending}>
                          {createUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Criar Utilizador
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="assign" className="mt-4">
                  <Form {...assignForm}>
                    <form onSubmit={assignForm.handleSubmit(handleAssignRole)} className="space-y-4">
                      <FormField
                        control={assignForm.control}
                        name="user_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Utilizador</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o utilizador" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users?.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.full_name} ({u.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={assignForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Papel</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o papel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableRoles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {getRoleLabel(role)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={assignRoleMutation.isPending}>
                          {assignRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Atribuir Papel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilizador</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Papéis</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              {user.position && (
                                <p className="text-xs text-muted-foreground">{user.position}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{user.email}</p>
                            {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.provinces?.name && <p>{user.provinces.name}</p>}
                            {user.municipalities?.name && (
                              <p className="text-muted-foreground">{user.municipalities.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  className={`${ROLE_COLORS[role]} text-white text-xs cursor-pointer`}
                                  onClick={() => {
                                    if (canManageRole(role) && user.id !== currentUser?.id) {
                                      removeRoleMutation.mutate({ user_id: user.id, role });
                                    }
                                  }}
                                >
                                  {getRoleLabel(role)}
                                  {canManageRole(role) && user.id !== currentUser?.id && (
                                    <X className="h-3 w-3 ml-1" />
                                  )}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem papéis</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {user.id !== currentUser?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(user)}
                                  title="Editar perfil"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleActiveMutation.mutate({
                                      user_id: user.id,
                                      is_active: !user.is_active,
                                    })
                                  }
                                >
                                  {user.is_active ? 'Desativar' : 'Ativar'}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum utilizador encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {filteredUsers && filteredUsers.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {filteredUsers.length} utilizador(es) encontrado(s)
          </p>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Perfil do Utilizador</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={editingUser.avatar_url} />
                  <AvatarFallback>
                    {editingUser.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{editingUser.full_name}</p>
                  <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                </div>
              </div>
            )}
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="+244 923 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Técnico Agrícola" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Direcção Provincial" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="province_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setEditProvinceId(value);
                            editForm.setValue('municipality_id', '');
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="municipality_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!editProvinceId}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {editMunicipalities?.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Guardar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UsersPage;
