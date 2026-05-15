import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AppModule } from '@/lib/modules';

interface ModulePermissionsState {
  modules: AppModule[];
  /** True se o utilizador tem alguma restrição registada (lista não vazia) */
  isRestricted: boolean;
  isLoading: boolean;
}

/**
 * Carrega as permissões de módulo do utilizador autenticado.
 * Se não tiver nenhuma linha em module_permissions => acesso total (isRestricted=false).
 */
export function useModulePermissions(): ModulePermissionsState {
  const { user, isAdmin } = useAuth();
  const [modules, setModules] = useState<AppModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setModules([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('module_permissions')
        .select('module')
        .eq('user_id', user.id);
      if (cancelled) return;
      if (error) {
        console.error('Failed to load module permissions:', error);
        setModules([]);
      } else {
        setModules((data ?? []).map((r: any) => r.module as AppModule));
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isRestricted = !isAdmin && modules.length > 0;

  return { modules, isRestricted, isLoading };
}

/** Helper síncrono — verifica se um utilizador tem acesso a determinado módulo. */
export function checkModuleAccess(
  module: AppModule,
  state: { modules: AppModule[]; isRestricted: boolean },
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  if (!state.isRestricted) return true;
  return state.modules.includes(module);
}
