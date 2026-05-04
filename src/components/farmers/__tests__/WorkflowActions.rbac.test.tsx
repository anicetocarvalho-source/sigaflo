/**
 * RBAC frontend — verifica que utilizadores sem o papel necessário
 * NÃO conseguem ver/executar as transições do workflow.
 *
 * Matriz de permissões (de WorkflowActions.tsx):
 *  draft → submitted: admin_*, technician_*
 *  submitted → validated: admin_national/provincial, technician_national/provincial
 *  validated → approved: admin_national, admin_provincial
 *  approved → issued: admin_national (apenas)
 *  rejeição: depende do estado
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserRole } from '@/contexts/AuthContext';

// Auth mockável dinamicamente
let currentRoles: UserRole[] = [];
vi.mock('@/contexts/AuthContext', async () => {
  return {
    useAuth: () => ({
      user: { id: 'user-rbac' },
      roles: currentRoles,
      hasAnyRole: (required: UserRole[]) =>
        currentRoles.some((r) => required.includes(r)),
    }),
  };
});

vi.mock('@/hooks/useFarmers', () => ({
  useUpdateFarmer: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ insert: vi.fn().mockResolvedValue({ data: null, error: null }) }) },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Importação tardia para apanhar o mock
const { WorkflowActions } = await import('../WorkflowActions');

const renderWithClient = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  cleanup();
  currentRoles = [];
});

describe('WorkflowActions — RBAC frontend', () => {
  describe('Sem nenhum papel', () => {
    it.each(['draft', 'submitted', 'validated', 'approved'] as const)(
      'estado %s: não mostra botões de avanço nem rejeição',
      (status) => {
        currentRoles = [];
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="individual" />
        );
        expect(screen.queryByRole('button', { name: /Submeter/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Validar$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Rejeitar$/i })).not.toBeInTheDocument();
        // Mensagem informativa de bloqueio
        expect(screen.getByText(/Sem permissão para alterar/i)).toBeInTheDocument();
      }
    );
  });

  describe('technician_municipal — só pode submeter', () => {
    it('draft: vê "Submeter"', () => {
      currentRoles = ['technician_municipal'];
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="draft" farmerName="X" farmerType="individual" />
      );
      expect(screen.getByRole('button', { name: /Submeter/i })).toBeInTheDocument();
    });

    it.each(['submitted', 'validated', 'approved'] as const)(
      '%s: NÃO vê botões de validar/aprovar/emitir/rejeitar',
      (status) => {
        currentRoles = ['technician_municipal'];
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="individual" />
        );
        expect(screen.queryByRole('button', { name: /^Validar$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Rejeitar$/i })).not.toBeInTheDocument();
      }
    );
  });

  describe('technician_provincial — pode submeter, validar e rejeitar até validated', () => {
    it('submitted: vê Validar e Rejeitar', () => {
      currentRoles = ['technician_provincial'];
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="submitted" farmerName="X" farmerType="individual" />
      );
      expect(screen.getByRole('button', { name: /^Validar$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Rejeitar$/i })).toBeInTheDocument();
    });

    it('validated: NÃO vê Aprovar (requer admin)', () => {
      currentRoles = ['technician_provincial'];
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="validated" farmerName="X" farmerType="individual" />
      );
      expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
    });

    it('approved: NÃO vê Emitir Cartão nem Rejeitar', () => {
      currentRoles = ['technician_provincial'];
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="approved" farmerName="X" farmerType="individual" />
      );
      expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Rejeitar$/i })).not.toBeInTheDocument();
    });
  });

  describe('admin_provincial — pode validar e aprovar mas NÃO emitir', () => {
    it('validated: vê Aprovar', () => {
      currentRoles = ['admin_provincial'];
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="validated" farmerName="X" farmerType="individual" />
      );
      expect(screen.getByRole('button', { name: /Aprovar/i })).toBeInTheDocument();
    });

    it.each(['individual', 'family', 'company', 'cooperative', 'field_school'] as const)(
      'approved (%s): NÃO vê botão de finalização',
      (type) => {
        currentRoles = ['admin_provincial'];
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus="approved" farmerName="X" farmerType={type} />
        );
        expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
        // Sem permissão final mostra mensagem
        expect(screen.getByText(/Sem permissão/i)).toBeInTheDocument();
      }
    );
  });

  describe('admin_national — único papel autorizado a emitir/activar', () => {
    it.each(['individual', 'family', 'company'] as const)(
      'approved (%s): vê "Emitir Cartão"',
      (type) => {
        currentRoles = ['admin_national'];
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus="approved" farmerName="X" farmerType={type} />
        );
        expect(screen.getByRole('button', { name: /Emitir Cartão/i })).toBeInTheDocument();
      }
    );

    it.each(['cooperative', 'field_school'] as const)(
      'approved (%s): vê "Activar Registo"',
      (type) => {
        currentRoles = ['admin_national'];
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus="approved" farmerName="X" farmerType={type} />
        );
        expect(screen.getByRole('button', { name: /Activar Registo/i })).toBeInTheDocument();
      }
    );
  });

  describe('Papéis sem permissão de workflow', () => {
    it.each(['private_entity', 'viewer'] as UserRole[])(
      '%s: nunca vê acções de workflow em qualquer estado',
      (role) => {
        currentRoles = [role];
        for (const status of ['draft', 'submitted', 'validated', 'approved'] as const) {
          cleanup();
          renderWithClient(
            <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="individual" />
          );
          expect(screen.queryByRole('button', { name: /Submeter/i })).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: /^Validar$/i })).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
        }
      }
    );
  });
});
