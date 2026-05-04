/**
 * Estados de workflow inválidos — garante que:
 *  1. O UI NÃO oferece a acção final ("Emitir Cartão" / "Activar Registo")
 *     a partir de qualquer estado que não seja `approved`.
 *  2. Estados terminais (`issued`, `rejected`) não mostram acções.
 *  3. Estados desconhecidos/inesperados degradam graciosamente
 *     (sem botão final, sem crash).
 *  4. Em todos esses casos NENHUMA entrada é gravada em `audit_log`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowActions } from '../WorkflowActions';

// admin_national — papel mais permissivo, isola o teste apenas no estado actual
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-invalid' },
    roles: ['admin_national'],
    hasAnyRole: () => true,
  }),
}));

const updateMutate = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useFarmers', () => ({
  useUpdateFarmer: () => ({ mutateAsync: updateMutate }),
}));

const insertSpy = vi.fn().mockResolvedValue({ data: null, error: null });
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ insert: insertSpy }) },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderWithClient = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

const FINAL_BUTTON_RE = /Emitir Cartão|Activar Registo/i;

beforeEach(() => {
  cleanup();
  insertSpy.mockClear();
  updateMutate.mockClear();
});

describe('WorkflowActions — estados inválidos / saltos directos', () => {
  describe('Salto directo para a acção final é IMPOSSÍVEL', () => {
    it.each(['draft', 'submitted', 'validated'] as const)(
      '%s: NÃO mostra "Emitir Cartão" nem "Activar Registo" (apenas a transição seguinte)',
      (status) => {
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="individual" />
        );
        expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
      }
    );

    it.each(['draft', 'submitted', 'validated'] as const)(
      '%s + cooperative: NÃO mostra "Activar Registo"',
      (status) => {
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="cooperative" />
        );
        expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
      }
    );

    it('draft: só mostra "Submeter" — não há atalho para emissão', () => {
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="draft" farmerName="X" farmerType="individual" />
      );
      expect(screen.getByRole('button', { name: /Submeter/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
    });

    it('submitted: só mostra "Validar" + "Rejeitar"', () => {
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="submitted" farmerName="X" farmerType="individual" />
      );
      expect(screen.getByRole('button', { name: /^Validar$/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
    });

    it('validated: só mostra "Aprovar" + "Rejeitar"', () => {
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="validated" farmerName="X" farmerType="individual" />
      );
      expect(screen.getByRole('button', { name: /Aprovar/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
    });
  });

  describe('Estados terminais — sem acções nem auditoria', () => {
    it.each(['issued', 'rejected'] as const)(
      '%s: componente não renderiza nenhuma acção',
      (status) => {
        const { container } = renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="individual" />
        );
        expect(container.querySelectorAll('button').length).toBe(0);
        expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
      }
    );

    it.each(['issued', 'rejected'] as const)(
      '%s + cooperative: idem (sem acções)',
      (status) => {
        const { container } = renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="cooperative" />
        );
        expect(container.querySelectorAll('button').length).toBe(0);
      }
    );
  });

  describe('Estados desconhecidos / inesperados', () => {
    it.each([
      'unknown',
      'pending_review',
      'archived',
      '',
      'APPROVED', // case mismatch
      'issuedd',  // typo
    ])('"%s": NÃO mostra acção final e degrada graciosamente', (badStatus) => {
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus={badStatus} farmerName="X" farmerType="individual" />
      );
      expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Submeter/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Validar$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Aprovar/i })).not.toBeInTheDocument();
      // Mensagem informativa em vez de crash
      expect(screen.getByText(/Sem permissão para alterar/i)).toBeInTheDocument();
    });
  });

  describe('Nenhuma auditoria gravada para estados inválidos', () => {
    const INVALID_STATES = [
      'draft', 'submitted', 'validated',  // não permitem ir directo a issued
      'issued', 'rejected',                // terminais
      'unknown', 'archived', '',           // inesperados
    ];

    it.each(INVALID_STATES)(
      '"%s": render inicial não dispara insert em audit_log nem update do farmer',
      (status) => {
        renderWithClient(
          <WorkflowActions farmerId="f" currentStatus={status} farmerName="X" farmerType="individual" />
        );
        expect(insertSpy).not.toHaveBeenCalled();
        expect(updateMutate).not.toHaveBeenCalled();
      }
    );

    it('coop em estado intermédio (submitted): nenhum botão final renderizado, nenhuma auditoria', () => {
      renderWithClient(
        <WorkflowActions farmerId="f" currentStatus="submitted" farmerName="Coop" farmerType="cooperative" />
      );
      expect(screen.queryByRole('button', { name: FINAL_BUTTON_RE })).not.toBeInTheDocument();
      expect(insertSpy).not.toHaveBeenCalled();
    });
  });
});
