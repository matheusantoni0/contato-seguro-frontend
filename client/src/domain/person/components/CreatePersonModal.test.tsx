import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, server } from '../../../test/setup';
import { personHandlers } from '../../../test/handlers/person.handlers';
import { CreatePersonModal } from './CreatePersonModal';

vi.mock('../People.context', () => ({
    usePeopleContext: () => ({
        setIsCreateModalVisible: vi.fn(),
        fetchPeople: vi.fn(),
        isCreateModalVisible: true,
    }),
}));

async function fillAndSubmitForm(overrides: Record<string, string> = {}) {
    const user = userEvent.setup();

    const values = {
        name: 'Ana Silva',
        cpf: '52998224725',
        email: 'ana@example.com',
        ...overrides,
    };

    await user.type(screen.getByLabelText(/Nome completo/i), values.name);
    await user.type(screen.getByLabelText(/CPF/i), values.cpf);
    await user.type(screen.getByLabelText(/E-mail/i), values.email);

    // DatePicker do antd 5: precisamos clicar no wrapper em vez do input
    const dateInput = screen.getByPlaceholderText('DD/MM/AAAA');
    await user.click(dateInput);
    await user.keyboard('15/03/1990{Enter}');

    await user.click(screen.getByRole('button', { name: /Cadastrar/i }));
}

describe('CreatePersonModal', () => {
    it('exibe o título do modal ao renderizar', () => {
        renderWithProviders(<CreatePersonModal />);
        expect(screen.getByText('Cadastrar pessoa')).toBeInTheDocument();
    });

    it('exibe notificação de CPF duplicado ao receber 409', async () => {
        server.use(personHandlers.createConflict());
        renderWithProviders(<CreatePersonModal />);
        await fillAndSubmitForm();

        await waitFor(() => {
            expect(
                screen.getByText('Já existe uma pessoa cadastrada com este CPF.'),
            ).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('exibe notificação de CPF duplicado (soft delete) ao receber 500 com constraint SQL', async () => {
        server.use(personHandlers.createSqlDuplicate());
        renderWithProviders(<CreatePersonModal />);
        await fillAndSubmitForm();

        await waitFor(() => {
            expect(
                screen.getByText('Já existe uma pessoa cadastrada com este CPF.'),
            ).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('exibe mensagem de validação de data ao receber 422 com birth date inválida', async () => {
        server.use(personHandlers.createValidationError('birth_date'));
        renderWithProviders(<CreatePersonModal />);
        await fillAndSubmitForm();

        await waitFor(() => {
            expect(
                screen.getByText(
                    'A data de nascimento informada é inválida. Verifique o valor e tente novamente.',
                ),
            ).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('valida CPF inválido no lado do cliente antes de enviar à API', async () => {
        renderWithProviders(<CreatePersonModal />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Nome completo/i), 'Test User');
        await user.type(screen.getByLabelText(/CPF/i), '11111111111'); // CPF inválido (sequência)
        await user.type(screen.getByLabelText(/E-mail/i), 'test@test.com');
        await user.click(screen.getByRole('button', { name: /Cadastrar/i }));

        await waitFor(() => {
            expect(
                screen.getByText('CPF inválido. Verifique o número informado e tente novamente.'),
            ).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
