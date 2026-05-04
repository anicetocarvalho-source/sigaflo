import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CardTabEmptyState } from '../CardTabEmptyState';

const renderWith = (type: 'cooperative' | 'field_school' | 'company') =>
  render(
    <MemoryRouter initialEntries={[`/agricultores/abc-123?tab=card`]}>
      <CardTabEmptyState farmerType={type} farmerId="abc-123" />
    </MemoryRouter>
  );

describe('<CardTabEmptyState />', () => {
  it('cooperative: mostra mensagem e link para detalhes da cooperativa', () => {
    renderWith('cooperative');
    expect(screen.getByTestId('card-tab-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/Cooperativas não emitem cartão SIGAFLO/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Ver detalhes da cooperativa/i });
    expect(link).toHaveAttribute('href', '/agricultores/abc-123?tab=entity-details');
  });

  it('field_school: mostra mensagem pedagógica e link para detalhes da ECA', () => {
    renderWith('field_school');
    expect(screen.getByText(/Escolas de Campo não emitem cartão SIGAFLO/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Ver detalhes da ECA/i });
    expect(link).toHaveAttribute('href', '/agricultores/abc-123?tab=entity-details');
  });

  it('company: mostra mensagem para empresa e link para documentos', () => {
    renderWith('company');
    expect(screen.getByText(/Cartão SIGAFLO indisponível para empresas/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Ver documentos da empresa/i });
    expect(link).toHaveAttribute('href', '/agricultores/abc-123?tab=documents');
  });

  it('exibe badge "Funcionalidade não aplicável" para todos os tipos', () => {
    for (const t of ['cooperative', 'field_school', 'company'] as const) {
      const { unmount } = renderWith(t);
      expect(screen.getByText(/Funcionalidade não aplicável/i)).toBeInTheDocument();
      unmount();
    }
  });
});
