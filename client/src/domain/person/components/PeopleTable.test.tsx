import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PeopleTable } from './PeopleTable';
import type { Person } from '../person.type';
import React from 'react';

vi.mock('../People.context', () => ({
    usePeopleContext: () => ({
        setIsCreateModalVisible: vi.fn(),
        fetchPeople: vi.fn(),
    }),
}));

const MOCK_PEOPLE: Person.Model[] = [
    {
        id: 1,
        name: 'Ana Silva',
        cpf: '52998224725', // CPF válido gerado para teste
        email: 'ana.silva@example.com',
        birth_date: '1990-03-15',
        created_at: '2026-01-01T00:00:00.000000Z',
        updated_at: null,
        deleted_at: null,
    },
    {
        id: 2,
        name: 'João Souza',
        cpf: '11144477735', // CPF válido gerado para teste
        email: 'joao@example.com',
        birth_date: '1985-07-20',
        created_at: '2026-01-01T00:00:00.000000Z',
        updated_at: null,
        deleted_at: null,
    },
];

describe('PeopleTable', () => {
    it('exibe os nomes das pessoas quando não está carregando', () => {
        render(<PeopleTable people={MOCK_PEOPLE} isLoading={false} />);
        expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        expect(screen.getByText('João Souza')).toBeInTheDocument();
    });

    it('exibe CPF ofuscado (nunca o CPF completo)', () => {
        render(<PeopleTable people={MOCK_PEOPLE} isLoading={false} />);
        expect(screen.getByText('529.***.***-**')).toBeInTheDocument();
        expect(screen.queryByText('52998224725')).not.toBeInTheDocument();
    });

    it('exibe data de nascimento no formato DD/MM/AAAA', () => {
        render(<PeopleTable people={MOCK_PEOPLE} isLoading={false} />);
        expect(screen.getByText('15/03/1990')).toBeInTheDocument();
    });

    it('exibe skeleton em vez de dados quando isLoading é true', () => {
        render(<PeopleTable people={[]} isLoading={true} />);
        // Skeleton renderiza sem texto de pessoa
        expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument();
    });

    it('exibe mensagem de "Não há dados" quando lista é vazia e não está carregando', () => {
        render(<PeopleTable people={[]} isLoading={false} />);
        expect(screen.getByText('Não há dados')).toBeInTheDocument();
    });
});
