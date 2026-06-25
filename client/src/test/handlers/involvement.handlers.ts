import { http, HttpResponse } from 'msw';
import { getBaseUrl } from '@domain/@shared/request';

const BASE = () => getBaseUrl();

export const involvementHandlers = {
    listWithData: (recordId: number) =>
        http.get(`${BASE()}/records/${recordId}/involvements`, () =>
            HttpResponse.json({
                statusCode: 200,
                data: {
                    involvements: [
                        {
                            id: 1,
                            type: 'whistleblower',
                            record_id: recordId,
                            person_id: 1,
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: null,
                            deleted_at: null,
                            person: {
                                id: 1,
                                name: 'Ana Silva',
                                cpf: '52998224725',
                                email: 'ana@example.com',
                                birth_date: '1990-03-15',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: null,
                                deleted_at: null,
                            },
                        },
                    ],
                    is_anonymous: false,
                },
            }),
        ),

    listEmpty: (recordId: number) =>
        http.get(`${BASE()}/records/${recordId}/involvements`, () =>
            HttpResponse.json({
                statusCode: 200,
                data: { involvements: [], is_anonymous: true },
            }),
        ),

    deleteSuccess: (recordId: number, involvementId: number) =>
        http.delete(
            `${BASE()}/records/${recordId}/involvements/${involvementId}`,
            () => HttpResponse.json({ statusCode: 200, data: undefined }),
        ),
};
