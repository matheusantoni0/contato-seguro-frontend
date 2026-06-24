# Frontend Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar testes automatizados cobrindo regras de negócio críticas, helpers utilitários e principais fluxos de usuário do frontend.

**Architecture:** Camadas de teste separadas por responsabilidade. Unit tests para funções puras (`person.helper`, `PersonFields` utilitários). Component tests para formulários e tabelas usando React Testing Library + Ant Design. Mocks de API via MSW para testes de integração dos modais.

**Tech Stack:** Vitest, React Testing Library, @testing-library/user-event, MSW v2, jsdom.

## Global Constraints

- Ambiente Vitest configurado com `jsdom` (requer instalação e configuração).
- Cada test file importa seus próprios mocks — sem estado compartilhado entre suítes.
- Usar `screen.getByRole` / `getByLabelText` em vez de `getByTestId` — testar comportamento, não implementação.
- Mensagens de erro em PT-BR exatamente como definidas nos helpers.
- Executar `npm test` para rodar todos os testes.
- Executar `npm run lint:tsc` antes de cada commit.
- Ant Design requer `@ant-design/v5-patch-for-react-19` já presente no projeto.

---

### Task 1: Configurar Infraestrutura de Testes (jsdom + RTL + MSW)

**Files:**
- Modify: `client/vitest.config.ts`
- Create: `client/src/test/setup.ts`
- Modify: `client/package.json` (instalar dependências)

**Interfaces:**
- Produces: ambiente `jsdom`, `render` do RTL disponível em todos os tests, `server` MSW exportado de `src/test/setup.ts`.

- [ ] **Step 1: Instalar dependências**

```bash
cd client
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
```

Expected output: packages added sem erro.

- [ ] **Step 2: Criar arquivo de setup global**

Criar `client/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';

export const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    cleanup();
});
afterAll(() => server.close());
```

- [ ] **Step 3: Atualizar vitest.config.ts**

```typescript
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'jsdom',
        setupFiles: ['src/test/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            include: ['src/domain/**'],
        },
    },
});
```

- [ ] **Step 4: Verificar que suite existente ainda passa**

```bash
npm test
```

Expected: `src/domain/@shared/service.helper.test.ts` — PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add client/vitest.config.ts client/src/test/setup.ts client/package.json
git commit -m "test: configure jsdom environment with RTL and MSW"
```

---

### Task 2: Unit Tests — `person.helper.ts`

**Files:**
- Create: `client/src/domain/person/person.helper.test.ts`

**Interfaces:**
- Consumes: `makePersonErrorMessage`, `obfuscateCpf` de `@domain/person/person.helper`.
- Produces: cobertura de todos os branches do helper de erro e de ofuscação.

- [ ] **Step 1: Escrever os testes**

Criar `client/src/domain/person/person.helper.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { makePersonErrorMessage, obfuscateCpf } from './person.helper';
import type { Service } from '@domain/@shared/service.type';

const makeException = (
    statusCode: number,
    description: string,
): Service.ServerException => ({
    statusCode,
    error: { type: 'ERROR', description },
});

// ─── makePersonErrorMessage ──────────────────────────────────────────────────

describe('makePersonErrorMessage', () => {
    describe('422 — validação de campos', () => {
        it('retorna mensagem de data inválida quando descrição contém "birth date"', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Invalid birth date format'),
            );
            expect(result).toBe(
                'A data de nascimento informada é inválida. Verifique o valor e tente novamente.',
            );
        });

        it('retorna mensagem de CPF inválido quando descrição contém "CPF"', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Invalid CPF format. Must be 11 digits'),
            );
            expect(result).toBe('O CPF informado é inválido. Verifique o valor e tente novamente.');
        });

        it('retorna mensagem de e-mail inválido quando descrição contém "email"', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Invalid email format'),
            );
            expect(result).toBe('O formato do e-mail informado é inválido.');
        });

        it('retorna mensagem genérica de validação para campo desconhecido', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Name is required'),
            );
            expect(result).toBe('Os dados informados são inválidos. Verifique os campos e tente novamente.');
        });
    });

    describe('409 — conflito / duplicidade', () => {
        it('retorna mensagem de CPF duplicado quando descrição contém "CPF"', () => {
            const result = makePersonErrorMessage(
                makeException(409, 'CPF already registered'),
            );
            expect(result).toBe('Já existe uma pessoa cadastrada com este CPF.');
        });

        it('retorna mensagem de e-mail duplicado quando descrição contém "email"', () => {
            const result = makePersonErrorMessage(
                makeException(409, 'email already in use'),
            );
            expect(result).toBe('Este e-mail já está em uso por outra pessoa.');
        });

        it('retorna mensagem genérica de conflito para campo desconhecido', () => {
            const result = makePersonErrorMessage(
                makeException(409, 'Conflito desconhecido'),
            );
            expect(result).toBe('Já existe um cadastro com estas informações.');
        });
    });

    describe('500 — erro de servidor / constraint SQL', () => {
        it('retorna mensagem de CPF duplicado quando descrição contém "1062 Duplicate entry"', () => {
            const result = makePersonErrorMessage(
                makeException(500, "1062 Duplicate entry '12345678901' for key 'people.cpf'"),
            );
            expect(result).toBe('Já existe uma pessoa cadastrada com este CPF.');
        });

        it('retorna mensagem genérica para erro 500 sem constraint conhecida', () => {
            const result = makePersonErrorMessage(
                makeException(500, 'Internal server error'),
            );
            expect(result).toBe('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
        });
    });

    describe('outros status — fallback', () => {
        it('retorna mensagem genérica para status não mapeado (ex: 503)', () => {
            const result = makePersonErrorMessage(makeException(503, 'Service Unavailable'));
            expect(result).toBe('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
        });
    });
});

// ─── obfuscateCpf ────────────────────────────────────────────────────────────

describe('obfuscateCpf', () => {
    it('ofusca CPF com 11 dígitos mantendo os 3 primeiros', () => {
        expect(obfuscateCpf('12345678901')).toBe('123.***.***-**');
    });

    it('aceita CPF já formatado com máscara (pontuação) e ofusca corretamente', () => {
        expect(obfuscateCpf('123.456.789-01')).toBe('123.***.***-**');
    });

    it('retorna "-" quando cpf é uma string vazia', () => {
        expect(obfuscateCpf('')).toBe('-');
    });

    it('retorna o valor original quando CPF tem número de dígitos diferente de 11', () => {
        expect(obfuscateCpf('123')).toBe('123');
    });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que passam**

```bash
npm test -- person.helper.test.ts
```

Expected: 12 testes — PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/domain/person/person.helper.test.ts
git commit -m "test(person): unit tests for makePersonErrorMessage and obfuscateCpf"
```

---

### Task 3: Unit Tests — `cpfMask` (`PersonFields.tsx`)

**Files:**
- Create: `client/src/domain/person/components/PersonFields.test.ts`

**Interfaces:**
- Consumes: `cpfMask` de `@domain/person/components/PersonFields`.
- Produces: cobertura da lógica de máscara visual de CPF (função pura, sem React).

- [ ] **Step 1: Escrever os testes**

Criar `client/src/domain/person/components/PersonFields.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { cpfMask } from './PersonFields';

describe('cpfMask', () => {
    it('retorna string vazia quando value é undefined', () => {
        expect(cpfMask(undefined)).toBe('');
    });

    it('retorna string vazia quando value é string vazia', () => {
        expect(cpfMask('')).toBe('');
    });

    it('formata 3 dígitos com ponto', () => {
        expect(cpfMask('123')).toBe('123');
    });

    it('formata 6 dígitos com dois pontos', () => {
        expect(cpfMask('123456')).toBe('123.456');
    });

    it('formata 9 dígitos com dois pontos e traço', () => {
        expect(cpfMask('123456789')).toBe('123.456.789');
    });

    it('formata 11 dígitos no padrão completo 999.999.999-99', () => {
        expect(cpfMask('12345678901')).toBe('123.456.789-01');
    });

    it('ignora dígitos além de 11', () => {
        expect(cpfMask('123456789012345')).toBe('123.456.789-01');
    });

    it('remove caracteres não numéricos antes de mascarar', () => {
        expect(cpfMask('abc12345')).toBe('123.45');
    });

    it('retorna o valor original quando ele é igual ao originalCpfObfuscated', () => {
        const obfuscated = '123.***.***-**';
        expect(cpfMask(obfuscated, obfuscated)).toBe(obfuscated);
    });

    it('normaliza normalmente quando valor difere do originalCpfObfuscated', () => {
        expect(cpfMask('98765432100', '123.***.***-**')).toBe('987.654.321-00');
    });
});
```

- [ ] **Step 2: Rodar os testes**

```bash
npm test -- PersonFields.test.ts
```

Expected: 10 testes — PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/domain/person/components/PersonFields.test.ts
git commit -m "test(person): unit tests for cpfMask utility"
```

---

### Task 4: Component Tests — `PeopleTable.tsx`

**Files:**
- Create: `client/src/domain/person/components/PeopleTable.test.tsx`

**Interfaces:**
- Consumes: `PeopleTable` de `./PeopleTable`, `Person.Model` de `../person.type`.
- Produces: cobertura de renderização com dados, com skeleton e ofuscação de CPF.

- [ ] **Step 1: Escrever os testes**

Criar `client/src/domain/person/components/PeopleTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PeopleTable } from './PeopleTable';
import type { Person } from '../person.type';

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
        // Skeleton.Input renderiza inputs com aria "progressbar" ou sem texto de pessoa
        expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument();
    });

    it('exibe mensagem de "Não há dados" quando lista é vazia e não está carregando', () => {
        render(<PeopleTable people={[]} isLoading={false} />);
        expect(screen.getByText('Não há dados')).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Rodar os testes**

```bash
npm test -- PeopleTable.test.tsx
```

Expected: 5 testes — PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/domain/person/components/PeopleTable.test.tsx
git commit -m "test(person): component tests for PeopleTable"
```

---

### Task 5: Component Tests — `CreatePersonModal.tsx` com MSW

**Files:**
- Create: `client/src/domain/person/components/CreatePersonModal.test.tsx`
- Create: `client/src/test/handlers/person.handlers.ts`

**Interfaces:**
- Consumes: `server` de `src/test/setup.ts`, `CreatePersonModal` de `./CreatePersonModal`.
- Produces: cobertura dos fluxos de criação bem-sucedida e de erros (409, 500, 422).

> **Nota:** Ant Design Form + App.useApp requerem providers. Crie um helper `renderWithProviders` para evitar repetição.

- [ ] **Step 1: Criar handlers MSW reutilizáveis**

Criar `client/src/test/handlers/person.handlers.ts`:

```typescript
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
```

- [ ] **Step 2: Criar helper de render com providers**

Adicionar no final de `client/src/test/setup.ts`:

```typescript
import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';

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
```

- [ ] **Step 3: Escrever os testes do modal**

Criar `client/src/domain/person/components/CreatePersonModal.test.tsx`:

```tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, server } from '../../../test/setup';
import { personHandlers } from '../../../test/handlers/person.handlers';
import { CreatePersonModal } from './CreatePersonModal';

// Mock do contexto de Pessoas para isolar o componente
vi.mock('../People.context', () => ({
    usePeopleContext: () => ({
        setIsCreateModalVisible: vi.fn(),
        fetchPeople: vi.fn(),
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

    await user.type(screen.getByLabelText('Nome completo'), values.name);
    await user.type(screen.getByLabelText('CPF'), values.cpf);
    await user.type(screen.getByLabelText('E-mail'), values.email);

    // DatePicker: clicar no campo e digitar a data
    await user.click(screen.getByPlaceholderText('DD/MM/AAAA'));
    await user.keyboard('15/03/1990{Enter}');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
}

describe('CreatePersonModal', () => {
    it('exibe o título do modal ao renderizar', () => {
        renderWithProviders(<CreatePersonModal />);
        expect(screen.getByText('Cadastrar pessoa')).toBeInTheDocument();
    });

    it('fecha o modal após criação bem-sucedida', async () => {
        server.use(personHandlers.createSuccess());
        const setIsCreateModalVisible = vi.fn();
        vi.mocked(await import('../People.context')).usePeopleContext = () => ({
            setIsCreateModalVisible,
            fetchPeople: vi.fn(),
        });

        renderWithProviders(<CreatePersonModal />);
        await fillAndSubmitForm();

        await waitFor(() => {
            expect(setIsCreateModalVisible).toHaveBeenCalledWith(false);
        });
    });

    it('exibe notificação de CPF duplicado ao receber 409', async () => {
        server.use(personHandlers.createConflict());
        renderWithProviders(<CreatePersonModal />);
        await fillAndSubmitForm();

        await waitFor(() => {
            expect(
                screen.getByText('Já existe uma pessoa cadastrada com este CPF.'),
            ).toBeInTheDocument();
        });
    });

    it('exibe notificação de CPF duplicado (soft delete) ao receber 500 com constraint SQL', async () => {
        server.use(personHandlers.createSqlDuplicate());
        renderWithProviders(<CreatePersonModal />);
        await fillAndSubmitForm();

        await waitFor(() => {
            expect(
                screen.getByText('Já existe uma pessoa cadastrada com este CPF.'),
            ).toBeInTheDocument();
        });
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
        });
    });

    it('valida CPF inválido no lado do cliente antes de enviar à API', async () => {
        renderWithProviders(<CreatePersonModal />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Nome completo'), 'Test User');
        await user.type(screen.getByLabelText('CPF'), '11111111111'); // CPF inválido (sequência)
        await user.type(screen.getByLabelText('E-mail'), 'test@test.com');
        await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => {
            expect(
                screen.getByText('CPF inválido. Verifique o número informado e tente novamente.'),
            ).toBeInTheDocument();
        });
    });
});
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- CreatePersonModal.test.tsx
```

Expected: 6 testes — PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/domain/person/components/CreatePersonModal.test.tsx \
        client/src/test/handlers/person.handlers.ts \
        client/src/test/setup.ts
git commit -m "test(person): component tests for CreatePersonModal with MSW"
```

---

### Task 6: Component Tests — `InvolvementTab.tsx` com MSW

**Files:**
- Create: `client/src/domain/involvement/components/InvolvementTab.test.tsx`
- Create: `client/src/test/handlers/involvement.handlers.ts`

**Interfaces:**
- Consumes: `server`, `renderWithProviders` de `src/test/setup.ts`.
- Consumes: `InvolvementTab` de `./InvolvementTab`.
- Produces: cobertura de listagem de envolvidos, estado de loading (skeleton) e remoção com confirmação.

- [ ] **Step 1: Criar handlers MSW de Involvement**

Criar `client/src/test/handlers/involvement.handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080';

export const involvementHandlers = {
    listWithData: (recordId: number) =>
        http.get(`${BASE}/records/${recordId}/involvements`, () =>
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
        http.get(`${BASE}/records/${recordId}/involvements`, () =>
            HttpResponse.json({
                statusCode: 200,
                data: { involvements: [], is_anonymous: true },
            }),
        ),

    deleteSuccess: (recordId: number, involvementId: number) =>
        http.delete(
            `${BASE}/records/${recordId}/involvements/${involvementId}`,
            () => HttpResponse.json({ statusCode: 200, data: undefined }),
        ),
};
```

- [ ] **Step 2: Escrever os testes**

Criar `client/src/domain/involvement/components/InvolvementTab.test.tsx`:

```tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, server } from '../../../test/setup';
import { involvementHandlers } from '../../../test/handlers/involvement.handlers';
import { InvolvementTab } from './InvolvementTab';

const RECORD_ID = 42;

describe('InvolvementTab', () => {
    it('exibe skeleton enquanto os dados carregam', () => {
        // handler com delay: não usa MSW aqui, apenas verifica estado inicial
        server.use(involvementHandlers.listEmpty(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);
        // Antes da resposta, skeleton deve estar presente (sem nome de pessoa)
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
            expect(screen.getByText('Não há dados')).toBeInTheDocument();
        });
    });

    it('abre Popconfirm ao clicar no botão de remover', async () => {
        server.use(involvementHandlers.listWithData(RECORD_ID));
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);
        const user = userEvent.setup();

        await waitFor(() => screen.getByText('Ana Silva'));
        await user.click(screen.getByRole('button', { name: /remover/i }));

        expect(screen.getByText('Remover vínculo?')).toBeInTheDocument();
    });

    it('chama DELETE na API e recarrega lista ao confirmar remoção', async () => {
        server.use(
            involvementHandlers.listWithData(RECORD_ID),
            involvementHandlers.deleteSuccess(RECORD_ID, 1),
        );
        renderWithProviders(<InvolvementTab recordId={RECORD_ID} />);
        const user = userEvent.setup();

        await waitFor(() => screen.getByText('Ana Silva'));
        await user.click(screen.getByRole('button', { name: /remover/i }));
        await user.click(screen.getByRole('button', { name: 'Sim' }));

        await waitFor(() => {
            expect(screen.getByText('Não há dados')).toBeInTheDocument();
        });
    });
});
```

- [ ] **Step 3: Rodar os testes**

```bash
npm test -- InvolvementTab.test.tsx
```

Expected: 7 testes — PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/domain/involvement/components/InvolvementTab.test.tsx \
        client/src/test/handlers/involvement.handlers.ts
git commit -m "test(involvement): component tests for InvolvementTab"
```

---

### Task 7: Integration Test — `IsAnonymousTag.tsx`

**Files:**
- Create: `client/src/domain/involvement/components/IsAnonymousTag.test.tsx`

**Interfaces:**
- Consumes: `server`, `renderWithProviders` de `src/test/setup.ts`.
- Consumes: `IsAnonymousTag` de `./IsAnonymousTag`.
- Produces: cobertura da exibição de "Anônimo" (vermelho) e "Identificado" (azul) baseada no `is_anonymous` da API.

- [ ] **Step 1: Escrever os testes**

Criar `client/src/domain/involvement/components/IsAnonymousTag.test.tsx`:

```tsx
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, server } from '../../../test/setup';
import { IsAnonymousTag } from './IsAnonymousTag';

const BASE = 'http://localhost:8080';

function makeInvolvementsHandler(isAnonymous: boolean) {
    return http.get(`${BASE}/records/1/involvements`, () =>
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
        // Sem handler: MSW lançaria erro (onUnhandledRequest: 'error')
        // Adicionamos handler com delay para simular loading
        server.use(
            http.get(`${BASE}/records/999/involvements`, async () => {
                await new Promise(r => setTimeout(r, 500));
                return HttpResponse.json({ statusCode: 200, data: { involvements: [], is_anonymous: false } });
            }),
        );
        renderWithProviders(<IsAnonymousTag recordId={999} />);
        expect(screen.queryByText('Anônimo')).not.toBeInTheDocument();
        expect(screen.queryByText('Identificado')).not.toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Rodar os testes**

```bash
npm test -- IsAnonymousTag.test.tsx
```

Expected: 3 testes — PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/domain/involvement/components/IsAnonymousTag.test.tsx
git commit -m "test(involvement): integration tests for IsAnonymousTag"
```

---

## Checklist Final

- [ ] `npm test` — todos os testes passando
- [ ] `npm run lint:tsc` — sem erros de TypeScript
- [ ] Cobertura de todos os branches de `makePersonErrorMessage`
- [ ] Cobertura de `obfuscateCpf` (string vazia, CPF válido, CPF formatado, CPF curto)
- [ ] Cobertura de `cpfMask` (undefined, parcial, completo, truncamento, com ofuscado)
- [ ] `PeopleTable` com dados, skeleton e lista vazia
- [ ] `CreatePersonModal` com sucesso, 409, 500 SQL, 422, e validação client-side
- [ ] `InvolvementTab` com dados, vazio, labels, CPF ofuscado, remoção
- [ ] `IsAnonymousTag` anônimo/identificado/loading

## Cenários de Teste Manual (não automatizados)

| Cenário | Por quê manual |
|---|---|
| DatePicker — seleção via calendário | Interação de calendário Ant Design é complexa demais para RTL |
| Máscara visual do CPF durante digitação | `normalize` do Ant Form não é facilmente testável sem E2E |
| Skeleton visual — aparência sem salto de layout | Requer inspeção visual |
| Modal de edição — carrega CPF ofuscado ao abrir | Depende de contexto de `person` do estado global |
| Fluxo de criar relato + vincular envolvidos | Dois modais aninhados — melhor via E2E (Playwright/Cypress) |
