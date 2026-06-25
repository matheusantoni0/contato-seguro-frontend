# Visão Geral

A aplicação **Contato Seguro Slim** é um sistema de gestão voltado para o gerenciamento de empresas, pessoas e registros de envolvimento. O projeto foi concebido para ser uma ferramenta robusta, com foco em produtividade técnica e consistência visual, permitindo a evolução rápida de funcionalidades sem comprometer a estabilidade do código.

### Objetivos de Negócio
- Centralizar o cadastro e consulta de entidades corporativas e individuais.
- Fornecer visibilidade clara sobre o envolvimento de pessoas em registros específicos.
- Garantir a integridade dos dados através de validações rigorosas (CPF, campos obrigatórios).

### Tecnologias Utilizadas
- **React 19**: Versão mais recente para aproveitar melhorias de performance e concorrência.
- **Vite**: Ferramenta de build ultra-rápida para uma experiência de desenvolvimento superior.
- **TypeScript**: Tipagem estrita em toda a camada de domínio e serviços.
- **Ant Design (AntD)**: Biblioteca de componentes UI para garantir padrões visuais de alta qualidade e produtividade.
- **React Router 7**: Roteamento dinâmico e gerenciamento de navegação.
- **Vitest & React Testing Library**: Garantia de qualidade através de testes automatizados de integração e unidade.

# Estrutura de Pastas

O projeto adota uma arquitetura inspirada em **Domain-Driven Design (DDD)**, onde o código é organizado por unidades de negócio (Domínios) em vez de apenas por tipo técnico (folders como `components/`, `services/`).

```text
src/
├── assets/          # Recursos estáticos (imagens, svgs)
├── domain/          # Coração da aplicação (lógica de negócio)
│   ├── @shared/     # Utilitários, tipos e componentes transversais
│   ├── company/     # Domínio de Empresas
│   ├── person/      # Domínio de Pessoas
│   ├── record/      # Domínio de Registros
│   └── involvement/ # Domínio de Envolvimentos
├── pages/           # Camada de orquestração (Páginas da rota)
├── test/            # Configurações globais de testes e mocks (MSW)
├── App.tsx          # Componente raiz
├── MainLayout.tsx   # Layout principal (Sidebar, Header, Content)
├── router.tsx       # Definição das rotas da aplicação
└── main.tsx         # Ponto de entrada
```

**Critérios de Organização:**
- **Domain Scoping:** Cada pasta dentro de `domain/` é autocontida. Ela contém seus próprios serviços de API, componentes específicos, tipos e gerenciamento de estado (Context).
- **Separation of Concerns:** As páginas (`pages/`) apenas orquestram os domínios. Elas não conhecem os detalhes de implementação das chamadas de API ou regras de negócio complexas.

# Fluxo de Dados

O fluxo de dados é unidirecional e previsível, seguindo o padrão **Service -> Context -> UI**.

1.  **Requisição:** O componente (ou o Context) chama um **Service** (ex: `listPeople`).
2.  **Transformação:** O service utiliza um utilitário centralizado (`Request`) para realizar a chamada HTTP e tipar a resposta.
3.  **Estado:** O dado retornado é armazenado em um **React Context** específico do domínio.
4.  **Consumo:** Os componentes da UI (Tabelas, Cards) consomem o estado do Context através de um hook customizado (ex: `usePeopleContext`).

### Exemplo Prático (Domínio Person)
Quando um usuário abre a página de Pessoas:
- O `PeopleContextProvider` dispara o `fetchPeople()` no `useEffect`.
- O `listPeople.service.ts` executa o fetch para `/people`.
- O dado é validado pelo TypeScript e salvo no estado `people` do contexto.
- A `PeopleTable` recebe essa lista automaticamente via Context e renderiza os dados.

# Organização de Componentes

### Divisão de Responsabilidades
- **Pages:** Definem a estrutura de layout e injetam os Context Providers necessários.
- **Domain Components:** Componentes especializados que conhecem as regras do domínio (ex: `PeopleTable`).
- **Shared Components:** Componentes genéricos e declarativos. Exemplo: `<Show when={condition}>`, que substitui ternários complexos no JSX para melhor legibilidade.

### Estratégia de Composição
Utilizamos **Composition over Inheritance**. Por exemplo, o componente `PersonFields.tsx` encapsula apenas os campos do formulário de pessoa. Ele é reutilizado tanto no `CreatePersonModal` quanto no `EditPersonModal`, garantindo que qualquer mudança na regra de campos reflita em ambos os lugares instantaneamente.

# Estratégia de Chamadas API

As chamadas são centralizadas na camada de `api/` dentro de cada domínio.

- **Request Wrapper:** Um utilitário baseado em `fetch` que injeta headers padrão, trata a URL base (`VITE_API_URL`) e captura exceções de rede inesperadas.
- **Contratos Tipados:** Cada serviço define explicitamente o formato da resposta esperada (`Data`) e o formato de erro (`Exception`).
- **Granularidade:** Preferimos arquivos pequenos (um por operação, ex: `create-person.service.ts`) para facilitar a manutenção e testes isolados.

# Tratamento de Erros

O sistema utiliza uma abordagem proativa para feedback ao usuário:

- **Erros de API:** Tratados centralizadamente pelo helper `handleServiceError`. Erros de validação do servidor são exibidos via `antd.notification.error` com descrições amigáveis.
- **Tratamento de Exceções:** Caso a API falhe ou retorne um formato inesperado, o sistema garante que a aplicação não "quebre", exibindo mensagens de erro padrão.
- **Feedback Visual:** Uso de `Spin` (AntD) para estados de carregamento e o componente `Empty` para listas vazias, garantindo uma boa experiência de usuário (UX).

# Escalabilidade

A arquitetura modular suporta o crescimento orgânico do projeto:

- **Novos Módulos:** Para adicionar um novo módulo (ex: "Departamentos"), basta criar uma nova pasta em `domain/`, seguindo os padrões já estabelecidos. Não há risco de efeitos colaterais em módulos existentes.
- **Baixo Acoplamento:** A comunicação entre domínios é feita via Props ou via composição de Contexts na Page, mantendo as responsabilidades isoladas.
- **Evolução Técnica:** A estrutura de serviços isolados permite que, no futuro, a biblioteca de fetch (`fetch` nativo) seja substituída por outra (como `axios`) alterando apenas um arquivo (`@shared/request.ts`).

# Decisões Técnicas

1.  **React Context vs Redux:** Optamos por Contextos descentralizados por domínio. Isso reduz o boilerplate, facilita o code-splitting e mantém o estado próximo de onde ele é usado. Para o volume de dados atual, é a solução mais eficiente.
2.  **Ant Design (AntD):** Decisão estratégica para garantir velocidade de entrega. O AntD fornece componentes complexos (Table, Modal, Form) prontos para uso, permitindo que o foco do desenvolvimento seja na lógica de negócio e não na criação de CSS básico.
3.  **Vite:** Escolhido pela performance no HMR (Hot Module Replacement), reduzindo drasticamente o tempo de espera durante o desenvolvimento.

# Trade-offs

- **Serviços Granulares:** A escolha de ter um arquivo por serviço aumenta a quantidade de arquivos, mas melhora significativamente a legibilidade e a facilidade de encontrar bugs.
- **State per Domain:** Ao não usar um estado global (como Redux), a comunicação entre dois domínios distantes pode exigir a elevação de estado para a Page. No entanto, para este projeto, a simplicidade de manutenção compensa essa potencial limitação.

# Melhorias Futuras

1.  **TanStack Query (React Query):** Migrar a camada de serviços para TanStack Query. Isso traria cache automático, sincronização de estado facilitada e removeria a necessidade de `fetchPeople` manuais dentro de `useEffect`.
2.  **React Hook Form:** Integrar com o AntD para um gerenciamento de formulários ainda mais performático e com validações declarativas baseadas em schemas (Zod/Yup).
3.  **Testes E2E (Playwright):** Adicionar uma camada de testes de ponta a ponta para validar os fluxos críticos de usuário (ex: fluxo completo de criação de registro de envolvimento).
4.  **i18n (Internationalization):** Implementar uma biblioteca como `react-i18next` para suportar múltiplos idiomas, indo além do locale do AntD.
