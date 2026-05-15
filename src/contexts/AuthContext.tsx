import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 
  | 'admin_national'
  | 'admin_provincial'
  | 'admin_municipal'
  | 'technician_national'
  | 'technician_provincial'
  | 'technician_municipal'
  | 'private_entity'
  | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar_url?: string;
  province_id?: string;
  municipality_id?: string;
  entity_id?: string;
  is_active: boolean;
  provinces?: { name: string };
  municipalities?: { name: string };
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  granted_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: UserRole[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isNationalLevel: boolean;
  canManageRole: (targetRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_LABELS: Record<UserRole, string> = {
  admin_national: 'Administrador Nacional',
  admin_provincial: 'Administrador Provincial',
  admin_municipal: 'Administrador Municipal',
  technician_national: 'Técnico Nacional',
  technician_provincial: 'Técnico Provincial',
  technician_municipal: 'Técnico Municipal',
  private_entity: 'Entidade Privada',
  viewer: 'Visualizador',
};

export const getRoleLabel = (role: UserRole): string => ROLE_LABELS[role] || role;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, provinces(name), municipalities(name)')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesData) {
        setRoles(rolesData.map((r: any) => r.role as UserRole));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const lastFetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleSession = (newSession: Session | null, event?: string) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      const newUserId = newSession?.user?.id ?? null;

      // Only refetch profile/roles when the user identity actually changes.
      // Ignore TOKEN_REFRESHED / USER_UPDATED events that keep the same user —
      // otherwise we trigger a re-render storm and parallel refresh-token
      // races that end up signing the user out automatically.
      if (newUserId && newUserId !== lastFetchedUserIdRef.current) {
        lastFetchedUserIdRef.current = newUserId;
        setTimeout(() => fetchUserData(newUserId), 0);
      } else if (!newUserId) {
        lastFetchedUserIdRef.current = null;
        setProfile(null);
        setRoles([]);
      }

      if (event === 'SIGNED_OUT') {
        lastFetchedUserIdRef.current = null;
        setProfile(null);
        setRoles([]);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => handleSession(newSession, event)
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      handleSession(existingSession);

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: UserRole): boolean => roles.includes(role);

  const hasAnyRole = (checkRoles: UserRole[]): boolean => 
    checkRoles.some(role => roles.includes(role));

  const isAdmin = hasAnyRole(['admin_national', 'admin_provincial', 'admin_municipal']);
  const isNationalLevel = hasAnyRole(['admin_national', 'technician_national']);

  const canManageRole = (targetRole: UserRole): boolean => {
    if (hasRole('admin_national')) return true;
    if (hasRole('admin_provincial')) {
      return ['admin_provincial', 'admin_municipal', 'technician_provincial', 'technician_municipal', 'private_entity', 'viewer'].includes(targetRole);
    }
    if (hasRole('admin_municipal')) {
      return ['admin_municipal', 'technician_municipal', 'private_entity', 'viewer'].includes(targetRole);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isLoading,
        signIn,
        signUp,
        signOut,
        hasRole,
        hasAnyRole,
        isAdmin,
        isNationalLevel,
        canManageRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
