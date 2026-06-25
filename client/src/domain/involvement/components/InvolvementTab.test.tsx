import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, server } from '../../../test/setup';
import { involvementHandlers } from '../../../test/handlers/involvement.handlers';
import { InvolvementTab } from './InvolvementTab';

const RECORD_ID = 42;

vi.mock('../../person/People.context', () => ({
    usePeopleContext: () => ({
        setIsCreateModalVisible: vi.fn(),
        fetchPeople: vi.fn(),
    }),
}));

describe('InvolvementTab', () => {
    it('exibe skeleton enquanto os dados carregam', () => {
        server.use(involvementHandlers.listEmpty(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);
        expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument();
    });

    it('exibe nome da pessoa envolvida após carregamento', async () => {
        server.use(involvementHandlers.listWithData(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });
    });

    it('exibe CPF da pessoa ofuscado (LGPD)', async () => {
        server.use(involvementHandlers.listWithData(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        await waitFor(() => {
            expect(screen.getByText('529.***.***-**')).toBeInTheDocument();
            expect(screen.queryByText('52998224725')).not.toBeInTheDocument();
        });
    });

    it('exibe label "Denunciante / Relator" para tipo whistleblower', async () => {
        server.use(involvementHandlers.listWithData(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        await waitFor(() => {
            expect(screen.getByText('Denunciante / Relator')).toBeInTheDocument();
        });
    });

    it('exibe mensagem de sem dados quando não há envolvidos', async () => {
        server.use(involvementHandlers.listEmpty(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        await waitFor(() => {
            const elements = screen.getAllByText('Não há dados');
            expect(elements.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('renderiza botão de remover vínculo para cada envolvido', async () => {
        server.use(involvementHandlers.listWithData(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        await waitFor(() => screen.getByText('Ana Silva'));

        expect(screen.getByRole('button', { name: /remover vínculo/i })).toBeInTheDocument();
    });

    it('renderiza botão "Vincular Pessoa"', async () => {
        server.use(involvementHandlers.listEmpty(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        expect(screen.getByText('Vincular Pessoa')).toBeInTheDocument();
    });

    it('exibe título "Pessoas Envolvidas"', () => {
        server.use(involvementHandlers.listEmpty(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);

        expect(screen.getByText('Pessoas Envolvidas')).toBeInTheDocument();
    });
});
