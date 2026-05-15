import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useModulePermissions, checkModuleAccess } from '@/hooks/useModulePermissions';
import { AppModule, getModuleForPath } from '@/lib/modules';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requireAnyRole?: boolean;
  requiredModule?: AppModule;
}

export const ProtectedRoute = ({
  children,
  requiredRoles,
  requireAnyRole = true,
  requiredModule,
}: ProtectedRouteProps) => {
  const { user, roles, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  const moduleState = useModulePermissions();

  if (isLoading || moduleState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRoles = requireAnyRole
      ? requiredRoles.some(role => roles.includes(role))
      : requiredRoles.every(role => roles.includes(role));

    if (!hasRequiredRoles) {
      return <Navigate to="/sem-permissao" replace />;
    }
  }

  // Verificação por módulo: explícito (prop) ou inferido pela rota.
  const moduleToCheck = requiredModule ?? getModuleForPath(location.pathname);
  if (moduleToCheck && !checkModuleAccess(moduleToCheck, moduleState, isAdmin)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return <>{children}</>;
};
