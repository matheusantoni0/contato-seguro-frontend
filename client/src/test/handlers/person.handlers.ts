import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080';

export const personHandlers = {
    createSuccess: () =>
        http.post(`${BASE}/people`, () =>
            HttpResponse.json(
                {
                    statusCode: 201,
                    data: {
                        person: {
                            id: 99,
                            name: 'Ana Silva',
                            cpf: '52998224725',
                            email: 'ana@example.com',
                            birth_date: '1990-03-15',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: null,
                            deleted_at: null,
                        },
                    },
                },
                { status: 201 },
            ),
        ),

    createConflict: () =>
        http.post(`${BASE}/people`, () =>
            HttpResponse.json(
                {
                    statusCode: 409,
                    error: { type: 'Conflict', description: 'CPF already registered' },
                },
                { status: 409 },
            ),
        ),

    createSqlDuplicate: () =>
        http.post(`${BASE}/people`, () =>
            HttpResponse.json(
                {
                    statusCode: 500,
                    error: {
                        type: 'Internal Server Error',
                        description: "1062 Duplicate entry '52998224725' for key 'people.cpf'",
                    },
                },
                { status: 500 },
            ),
        ),

    createValidationError: (field: 'birth_date' | 'CPF' | 'email') => {
        const messages = {
            birth_date: 'Invalid birth date format',
            CPF: 'Invalid CPF format. Must be 11 digits',
            email: 'Invalid email format',
        };
        return http.post(`${BASE}/people`, () =>
            HttpResponse.json(
                {
                    statusCode: 422,
                    error: { type: 'Unprocessable Entity', description: messages[field] },
                },
                { status: 422 },
            ),
        );
    },
};
