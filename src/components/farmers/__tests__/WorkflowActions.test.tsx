import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowActions } from '../WorkflowActions';

// Mock Auth — admin nacional vê todas as transições
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-test-1' },
    roles: ['admin_national'],
    hasAnyRole: () => true,
  }),
}));

// Mock mutation de actualização
vi.mock('@/hooks/useFarmers', () => ({
  useUpdateFarmer: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

// Mock Supabase audit insert
const insertSpy = vi.fn().mockResolvedValue({ data: null, error: null });
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ insert: insertSpy }),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderWithClient = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('WorkflowActions — rótulos por farmer_type', () => {
  beforeEach(() => {
    insertSpy.mockClear();
  });

  describe('Timeline (passo final)', () => {
    it.each(['individual', 'family', 'company'] as const)(
      '%s: timeline mostra "Emitido"',
      (type) => {
        renderWithClient(
          <WorkflowActions
            farmerId="f1"
            currentStatus="approved"
            farmerName="Teste"
            farmerType={type}
          />
        );
        expect(screen.getByText('Emitido')).toBeInTheDocument();
        expect(screen.queryByText('Activo')).not.toBeInTheDocument();
      }
    );

    it.each(['cooperative', 'field_school'] as const)(
      '%s: timeline mostra "Activo" em vez de "Emitido"',
      (type) => {
        renderWithClient(
          <WorkflowActions
            farmerId="f1"
            currentStatus="approved"
            farmerName="Teste"
            farmerType={type}
          />
        );
        expect(screen.getByText('Activo')).toBeInTheDocument();
        expect(screen.queryByText('Emitido')).not.toBeInTheDocument();
      }
    );
  });

  describe('Botão de acção final', () => {
    it.each(['individual', 'family', 'company'] as const)(
      '%s: botão "Emitir Cartão"',
      (type) => {
        renderWithClient(
          <WorkflowActions
            farmerId="f1"
            currentStatus="approved"
            farmerName="João"
            farmerType={type}
          />
        );
        expect(screen.getByRole('button', { name: /Emitir Cartão/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
      }
    );

    it.each(['cooperative', 'field_school'] as const)(
      '%s: botão "Activar Registo"',
      (type) => {
        renderWithClient(
          <WorkflowActions
            farmerId="f1"
            currentStatus="approved"
            farmerName="Coop X"
            farmerType={type}
          />
        );
        expect(screen.getByRole('button', { name: /Activar Registo/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
      }
    );
  });

  describe('Diálogo de confirmação — bloco explicativo', () => {
    it('individual: diálogo destaca emissão de cartão SIGAFLO', () => {
      renderWithClient(
        <WorkflowActions
          farmerId="f1"
          currentStatus="approved"
          farmerName="Maria"
          farmerType="individual"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Emitir Cartão/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/Vai ser emitido o Cartão SIGAFLO/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/cartão físico \(CR-80\)/i)).toBeInTheDocument();
    });

    it('cooperative: diálogo deixa claro que NÃO há cartão', () => {
      renderWithClient(
        <WorkflowActions
          farmerId="f1"
          currentStatus="approved"
          farmerName="Coop Lubango"
          farmerType="cooperative"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Activar Registo/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/Vai ser activado o Registo \(sem emissão de cartão\)/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/não são elegíveis/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/Nenhum cartão físico/i)).toBeInTheDocument();
    });

    it('field_school: badge de destino mostra "Activo"', () => {
      renderWithClient(
        <WorkflowActions
          farmerId="f1"
          currentStatus="approved"
          farmerName="ECA Huambo"
          farmerType="field_school"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Activar Registo/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Activo')).toBeInTheDocument();
    });

    it('passos não-finais não mostram bloco explicativo', () => {
      renderWithClient(
        <WorkflowActions
          farmerId="f1"
          currentStatus="submitted"
          farmerName="X"
          farmerType="cooperative"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /^Validar$/i }));
      expect(screen.queryByText(/Vai ser activado o Registo/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Vai ser emitido o Cartão/i)).not.toBeInTheDocument();
    });
  });

  describe('Audit log — finalização enriquecida', () => {
    it('individual: action workflow_card_issued + finalization.kind=card_issued', async () => {
      renderWithClient(
        <WorkflowActions
          farmerId="farmer-123"
          currentStatus="approved"
          farmerName="Paulo"
          farmerType="individual"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Emitir Cartão/i }));
      fireEvent.click(screen.getByRole('button', { name: /Confirmar Emitir Cartão/i }));

      await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());
      const payload = insertSpy.mock.calls[0][0];
      expect(payload.action).toBe('workflow_card_issued');
      expect(payload.entity_id).toBe('farmer-123');
      expect(payload.new_values.finalization.kind).toBe('card_issued');
      expect(payload.new_values.finalization.card_eligible).toBe(true);
      expect(payload.new_values.finalization.farmer_type).toBe('individual');
      expect(payload.new_values.finalization.actor_id).toBe('user-test-1');
      expect(payload.new_values.finalization.executed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('field_school: action workflow_registration_activated + kind=registration_activated', async () => {
      renderWithClient(
        <WorkflowActions
          farmerId="eca-9"
          currentStatus="approved"
          farmerName="ECA Bié"
          farmerType="field_school"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Activar Registo/i }));
      fireEvent.click(screen.getByRole('button', { name: /Confirmar Activar Registo/i }));

      await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());
      const payload = insertSpy.mock.calls[0][0];
      expect(payload.action).toBe('workflow_registration_activated');
      expect(payload.new_values.finalization.kind).toBe('registration_activated');
      expect(payload.new_values.finalization.card_eligible).toBe(false);
      expect(payload.new_values.finalization.farmer_type).toBe('field_school');
      expect(payload.new_values.finalization.type_reason).toMatch(/não elegível/i);
    });

    it('passo intermédio (submitted → validated) NÃO inclui finalization', async () => {
      renderWithClient(
        <WorkflowActions
          farmerId="f-mid"
          currentStatus="submitted"
          farmerName="Y"
          farmerType="individual"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /^Validar$/i }));
      fireEvent.click(screen.getByRole('button', { name: /Confirmar Validar/i }));

      await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());
      const payload = insertSpy.mock.calls[0][0];
      expect(payload.action).toBe('workflow_validated');
      expect(payload.new_values.finalization).toBeUndefined();
    });
  });
});
