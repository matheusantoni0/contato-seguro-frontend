import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, server } from '../../../test/setup';
import { getBaseUrl } from '@domain/@shared/request';
import { IsAnonymousTag } from '@domain/involvement/components/IsAnonymousTag';

function makeInvolvementsHandler(isAnonymous: boolean) {
    return http.get(`${getBaseUrl()}/records/1/involvements`, () =>
        HttpResponse.json({
            statusCode: 200,
            data: { involvements: [], is_anonymous: isAnonymous },
        }),
    );
}

describe('IsAnonymousTag', () => {
    it('exibe tag "Anônimo" quando is_anonymous é true', async () => {
        server.use(makeInvolvementsHandler(true));
        renderWithProviders(<IsAnonymousTag recordId={1} />);

        await waitFor(() => {
            expect(screen.getByText('Anônimo')).toBeInTheDocument();
        });
    });

    it('exibe tag "Identificado" quando is_anonymous é false', async () => {
        server.use(makeInvolvementsHandler(false));
        renderWithProviders(<IsAnonymousTag recordId={1} />);

        await waitFor(() => {
            expect(screen.getByText('Identificado')).toBeInTheDocument();
        });
    });

    it('não exibe nada enquanto aguarda resposta da API', () => {
        server.use(
            http.get(`${getBaseUrl()}/records/999/involvements`, async () => {
                await new Promise(r => setTimeout(r, 500));
                return HttpResponse.json({ statusCode: 200, data: { involvements: [], is_anonymous: false } });
            }),
        );
        renderWithProviders(<IsAnonymousTag recordId={999} />);
        expect(screen.queryByText('Anônimo')).not.toBeInTheDocument();
        expect(screen.queryByText('Identificado')).not.toBeInTheDocument();
    });
});
