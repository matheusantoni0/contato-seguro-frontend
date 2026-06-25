import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';

import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

export const server = setupServer();

vi.stubEnv('VITE_API_URL', 'http://localhost:8080');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    cleanup();
});
afterAll(() => server.close());

function AllProviders({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider locale={ptBR}>
            <App>{children}</App>
        </ConfigProvider>
    );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
    return render(ui, { wrapper: AllProviders, ...options });
}
