import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { People } from './People.page';
import { listPeople } from '@domain/person/api/list-people.service';
import { renderWithProviders } from '../test/setup';

// Mock do serviço de listagem
vi.mock('@domain/person/api/list-people.service', () => ({
    listPeople: vi.fn(),
}));

const mockPeople = [
    { id: 1, name: 'Alice Silva', cpf: '12345678901', email: 'alice@test.com' },
    { id: 2, name: 'Bob Santos', cpf: '98765432100', email: 'bob@test.com' },
];

describe('People Page Search Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (listPeople as any).mockResolvedValue({
            data: { people: mockPeople }
        });
    });

    it('should filter people based on search input after debounce', async () => {
        renderWithProviders(<People />);

        // Espera carregar os dados inicias
        await waitFor(() => {
            expect(screen.getByText('Alice Silva')).toBeDefined();
            expect(screen.getByText('Bob Santos')).toBeDefined();
        });

        const searchInput = screen.getByPlaceholderText(/Pesquisar por nome/i);
        
        // Digita "Santos"
        fireEvent.change(searchInput, { target: { value: 'Santos' } });

        // Inicialmente nada muda (por causa do debounce de 300ms)
        expect(screen.queryByText('Alice Silva')).not.toBeNull();

        // Espera o debounce e verifica o filtro
        await waitFor(() => {
            expect(screen.queryByText('Alice Silva')).toBeNull();
            expect(screen.getByText('Bob Santos')).toBeDefined();
        }, { timeout: 1000 });
    });

    it('should match search regardless of accents and case', async () => {
        (listPeople as any).mockResolvedValue({
            data: { people: [
                { id: 3, name: 'José Arimatéia', cpf: '111', email: 'j@a.com' }
            ]}
        });

        renderWithProviders(<People />);
        await screen.findByText('José Arimatéia');

        const searchInput = screen.getByPlaceholderText(/Pesquisar por nome/i);
        
        // Busca por "jose" (sem acento)
        fireEvent.change(searchInput, { target: { value: 'jose' } });

        await waitFor(() => {
            expect(screen.getByText('José Arimatéia')).toBeDefined();
        });

        // Busca por "ARIMATEIA" (uppercase e sem acento)
        fireEvent.change(searchInput, { target: { value: 'ARIMATEIA' } });

        await waitFor(() => {
            expect(screen.getByText('José Arimatéia')).toBeDefined();
        });
    });
});
