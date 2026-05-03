import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileGroupedNav } from '../ProfileGroupedNav';

const baseFarmer = (type: string) => ({ farmer_type: type });

describe('<ProfileGroupedNav />', () => {
  it('cooperative: mostra sub-aba "Detalhes da Cooperativa" e badge de Membros', () => {
    render(
      <ProfileGroupedNav
        farmer={baseFarmer('cooperative')}
        membersCount={7}
        farmerOrdersCount={0}
        activeTab="entity-details"
        onTabChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /Detalhes da Cooperativa/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Detalhes da ECA/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Biometria/i })).not.toBeInTheDocument();
  });

  it('field_school: mostra "Detalhes da ECA" e esconde Mecanização no grupo Operação', async () => {
    const onTabChange = vi.fn();
    render(
      <ProfileGroupedNav
        farmer={baseFarmer('field_school')}
        membersCount={3}
        farmerOrdersCount={0}
        activeTab="entity-details"
        onTabChange={onTabChange}
      />
    );
    expect(screen.getByRole('button', { name: /Detalhes da ECA/i })).toBeInTheDocument();

    // Switch to Operação group
    await userEvent.click(screen.getByRole('button', { name: /Operação/i }));
    expect(onTabChange).toHaveBeenCalled();
  });

  it('individual: mostra Agregado e Biometria, esconde Membros', () => {
    render(
      <ProfileGroupedNav
        farmer={baseFarmer('individual')}
        membersCount={0}
        farmerOrdersCount={0}
        activeTab="identification"
        onTabChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /Agregado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Biometria/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Membros/i })).not.toBeInTheDocument();
  });

  it('clicar numa sub-aba dispara onTabChange com o valor correto', async () => {
    const onTabChange = vi.fn();
    render(
      <ProfileGroupedNav
        farmer={baseFarmer('individual')}
        membersCount={0}
        farmerOrdersCount={0}
        activeTab="identification"
        onTabChange={onTabChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /Documentos/i }));
    expect(onTabChange).toHaveBeenCalledWith('documents');
  });
});
