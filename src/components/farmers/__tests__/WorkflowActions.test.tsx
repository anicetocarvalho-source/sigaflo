import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
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
const updateMutate = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useFarmers', () => ({
  useUpdateFarmer: () => ({
    mutateAsync: updateMutate,
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
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
  },
}));

const renderWithClient = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

const ALL_TYPES = ['individual', 'family', 'company', 'cooperative', 'field_school'] as const;
const CARD_TYPES = ['individual', 'family', 'company'] as const;
const ACTIVATION_TYPES = ['cooperative', 'field_school'] as const;

beforeEach(() => {
  insertSpy.mockClear();
  updateMutate.mockClear();
  toastSuccess.mockClear();
  toastError.mockClear();
  cleanup();
});

describe('WorkflowActions — E2E DOM: transição approved → issued/active', () => {
  describe('Timeline (passo final)', () => {
    it.each(CARD_TYPES)('%s: timeline mostra "Emitido" e nunca "Activo"', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="Teste" farmerType={type} />
      );
      expect(screen.getByText('Emitido')).toBeInTheDocument();
      expect(screen.queryByText('Activo')).not.toBeInTheDocument();
    });

    it.each(ACTIVATION_TYPES)('%s: timeline mostra "Activo" e nunca "Emitido"', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="Teste" farmerType={type} />
      );
      expect(screen.getByText('Activo')).toBeInTheDocument();
      expect(screen.queryByText('Emitido')).not.toBeInTheDocument();
    });

    it.each(ALL_TYPES)('%s: passo "Aprovado" está marcado como current na timeline', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="X" farmerType={type} />
      );
      // O label "Aprovado" deve aparecer com classe font-semibold (current)
      const aprovado = screen.getByText('Aprovado');
      expect(aprovado.className).toMatch(/font-semibold/);
    });
  });

  describe('Botão de acção final', () => {
    it.each(CARD_TYPES)('%s: botão "Emitir Cartão"', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="João" farmerType={type} />
      );
      expect(screen.getByRole('button', { name: /Emitir Cartão/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Activar Registo/i })).not.toBeInTheDocument();
    });

    it.each(ACTIVATION_TYPES)('%s: botão "Activar Registo"', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="Coop X" farmerType={type} />
      );
      expect(screen.getByRole('button', { name: /Activar Registo/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Emitir Cartão/i })).not.toBeInTheDocument();
    });
  });

  describe('Diálogo de confirmação — badges Aprovado → destino', () => {
    it.each(CARD_TYPES)('%s: badge destino mostra "Emitido"', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="N" farmerType={type} />
      );
      fireEvent.click(screen.getByRole('button', { name: /Emitir Cartão/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Aprovado')).toBeInTheDocument();
      expect(within(dialog).getByText('Emitido')).toBeInTheDocument();
    });

    it.each(ACTIVATION_TYPES)('%s: badge destino mostra "Activo"', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="N" farmerType={type} />
      );
      fireEvent.click(screen.getByRole('button', { name: /Activar Registo/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Aprovado')).toBeInTheDocument();
      expect(within(dialog).getByText('Activo')).toBeInTheDocument();
      expect(within(dialog).queryByText('Emitido')).not.toBeInTheDocument();
    });
  });

  describe('Diálogo de confirmação — bloco explicativo', () => {
    it.each(CARD_TYPES)('%s: banner AZUL com mensagem de cartão SIGAFLO', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="Maria" farmerType={type} />
      );
      fireEvent.click(screen.getByRole('button', { name: /Emitir Cartão/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/Vai ser emitido o Cartão SIGAFLO/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/cartão físico \(CR-80\)/i)).toBeInTheDocument();
      expect(within(dialog).getAllByText(/Maria/).length).toBeGreaterThan(0);
      expect(within(dialog).queryByText(/Vai ser activado o Registo/i)).not.toBeInTheDocument();
    });

    it.each(ACTIVATION_TYPES)('%s: banner ÂMBAR explicando que NÃO há cartão', (type) => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="Coop Lubango" farmerType={type} />
      );
      fireEvent.click(screen.getByRole('button', { name: /Activar Registo/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/Vai ser activado o Registo \(sem emissão de cartão\)/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/não são elegíveis/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/Nenhum cartão físico/i)).toBeInTheDocument();
      expect(within(dialog).queryByText(/Vai ser emitido o Cartão SIGAFLO/i)).not.toBeInTheDocument();
    });

    it('passos não-finais (submitted → validated) NÃO mostram bloco explicativo', () => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="submitted" farmerName="X" farmerType="cooperative" />
      );
      fireEvent.click(screen.getByRole('button', { name: /^Validar$/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).queryByText(/Vai ser activado o Registo/i)).not.toBeInTheDocument();
      expect(within(dialog).queryByText(/Vai ser emitido o Cartão/i)).not.toBeInTheDocument();
    });

    it('rejeição no passo approved NÃO mostra bloco explicativo final', () => {
      renderWithClient(
        <WorkflowActions farmerId="f1" currentStatus="approved" farmerName="X" farmerType="individual" />
      );
      fireEvent.click(screen.getByRole('button', { name: /^Rejeitar$/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).queryByText(/Vai ser emitido o Cartão SIGAFLO/i)).not.toBeInTheDocument();
      expect(within(dialog).queryByText(/Vai ser activado o Registo/i)).not.toBeInTheDocument();
      expect(within(dialog).getByText(/Rejeitar Registo/i)).toBeInTheDocument();
    });
  });

  describe('Confirmação E2E — audit log + toast', () => {
    it.each(CARD_TYPES)(
      '%s: confirmar emite workflow_card_issued + toast "Emitido"',
      async (type) => {
        renderWithClient(
          <WorkflowActions farmerId={`f-${type}`} currentStatus="approved" farmerName="Paulo" farmerType={type} />
        );
        fireEvent.click(screen.getByRole('button', { name: /Emitir Cartão/i }));
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Emitir Cartão/i }));

        await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());

        // Update farmer foi chamado para status=issued
        expect(updateMutate).toHaveBeenCalledWith({ id: `f-${type}`, status: 'issued' });

        const payload = insertSpy.mock.calls[0][0];
        expect(payload.action).toBe('workflow_card_issued');
        expect(payload.entity_id).toBe(`f-${type}`);
        expect(payload.entity_type).toBe('farmer');
        expect(payload.old_values.status).toBe('approved');
        expect(payload.new_values.status).toBe('issued');
        expect(payload.new_values.finalization).toMatchObject({
          kind: 'card_issued',
          card_eligible: true,
          farmer_type: type,
          issued_label: 'Emitir Cartão',
          actor_id: 'user-test-1',
        });
        expect(payload.new_values.finalization.executed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);

        // Toast com label "Emitido"
        await vi.waitFor(() => expect(toastSuccess).toHaveBeenCalled());
        expect(toastSuccess.mock.calls[0][0]).toMatch(/Emitido/);
      }
    );

    it.each(ACTIVATION_TYPES)(
      '%s: confirmar emite workflow_registration_activated + toast "Activo"',
      async (type) => {
        renderWithClient(
          <WorkflowActions farmerId={`e-${type}`} currentStatus="approved" farmerName="ECA Bié" farmerType={type} />
        );
        fireEvent.click(screen.getByRole('button', { name: /Activar Registo/i }));
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Activar Registo/i }));

        await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());

        expect(updateMutate).toHaveBeenCalledWith({ id: `e-${type}`, status: 'issued' });

        const payload = insertSpy.mock.calls[0][0];
        expect(payload.action).toBe('workflow_registration_activated');
        expect(payload.new_values.finalization).toMatchObject({
          kind: 'registration_activated',
          card_eligible: false,
          farmer_type: type,
          issued_label: 'Activar Registo',
        });
        expect(payload.new_values.finalization.type_reason).toMatch(/não elegível/i);

        await vi.waitFor(() => expect(toastSuccess).toHaveBeenCalled());
        expect(toastSuccess.mock.calls[0][0]).toMatch(/Activo/);
        expect(toastSuccess.mock.calls[0][0]).not.toMatch(/Emitido/);
      }
    );

    it('passo intermédio (submitted → validated) NÃO inclui finalization', async () => {
      renderWithClient(
        <WorkflowActions farmerId="f-mid" currentStatus="submitted" farmerName="Y" farmerType="individual" />
      );
      fireEvent.click(screen.getByRole('button', { name: /^Validar$/i }));
      fireEvent.click(screen.getByRole('button', { name: /Confirmar Validar/i }));

      await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());
      const payload = insertSpy.mock.calls[0][0];
      expect(payload.action).toBe('workflow_validated');
      expect(payload.new_values.finalization).toBeUndefined();
    });

    it('rejeição em approved sem motivo bloqueia a confirmação', async () => {
      renderWithClient(
        <WorkflowActions farmerId="f-rej" currentStatus="approved" farmerName="Z" farmerType="cooperative" />
      );
      fireEvent.click(screen.getByRole('button', { name: /^Rejeitar$/i }));
      const confirmBtn = screen.getByRole('button', { name: /Confirmar Rejeição/i });
      expect(confirmBtn).toBeDisabled();
      expect(insertSpy).not.toHaveBeenCalled();
    });
  });
});
