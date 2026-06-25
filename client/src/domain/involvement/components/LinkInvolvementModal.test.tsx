import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, server } from '../../../test/setup';
import { personHandlers } from '../../../test/handlers/person.handlers';
import { LinkInvolvementModal } from './LinkInvolvementModal';

const RECORD_ID = 42;

describe('LinkInvolvementModal', () => {
    const defaultProps = {
        recordId: RECORD_ID,
        isVisible: true,
        onClose: vi.fn(),
        onSuccess: vi.fn(),
    };

    it('renderiza o campo de busca de pessoas', async () => {
        server.use(personHandlers.listSuccess());
        renderWithProviders(<LinkInvolvementModal {...defaultProps} />);

        expect(screen.getByText('Vincular Pessoa')).toBeInTheDocument();
        expect(screen.getByLabelText('Pessoa')).toBeInTheDocument();
    });

    it('filtra pessoas por nome de forma insensível a acentos', async () => {
        const user = userEvent.setup();
        server.use(personHandlers.listSuccess());
        renderWithProviders(<LinkInvolvementModal {...defaultProps} />);

        // Abre o Select
        const select = screen.getByRole('combobox', { name: 'Pessoa' });
        await user.click(select);

        // Digita "joao" (sem acento) para encontrar "João Pedro"
        await user.type(select, 'joao');

        await waitFor(() => {
            expect(screen.getByText('João Pedro - 12345678901')).toBeInTheDocument();
            expect(screen.queryByText('Ana Silva - 52998224725')).not.toBeInTheDocument();
        });
    });

    it('filtra pessoas por CPF', async () => {
        const user = userEvent.setup();
        server.use(personHandlers.listSuccess());
        renderWithProviders(<LinkInvolvementModal {...defaultProps} />);

        const select = screen.getByRole('combobox', { name: 'Pessoa' });
        await user.click(select);

        // Digita parte do CPF da Ana Silva
        await user.type(select, '529982');

        await waitFor(() => {
            expect(screen.getByText('Ana Silva - 52998224725')).toBeInTheDocument();
            expect(screen.queryByText('João Pedro - 12345678901')).not.toBeInTheDocument();
        });
    });

    it('exibe o botão "Cadastrar nova pessoa" no dropdown', async () => {
        const user = userEvent.setup();
        server.use(personHandlers.listSuccess());
        renderWithProviders(<LinkInvolvementModal {...defaultProps} />);

        const select = screen.getByRole('combobox', { name: 'Pessoa' });
        await user.click(select);

        expect(screen.getByText('Cadastrar nova pessoa')).toBeInTheDocument();
    });

    it('abre o modal de criação ao clicar no botão de atalho', async () => {
        const user = userEvent.setup();
        server.use(personHandlers.listSuccess());
        renderWithProviders(<LinkInvolvementModal {...defaultProps} />);

        const select = screen.getByRole('combobox', { name: 'Pessoa' });
        await user.click(select);

        const addButton = screen.getByText('Cadastrar nova pessoa');
        await user.click(addButton);

        expect(screen.getByText('Cadastrar pessoa')).toBeInTheDocument();
    });
});
