# Implementation Plan: Pessoas e Envolvimentos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar as funcionalidades de gestão de Pessoas e de Envolvimentos em relatos, permitindo identificar envolvidos e automatizar a detecção de anonimato.

**Architecture:** Seguiremos o padrão Modular por Domínio. Criaremos os domínios `person` e `involvement`, utilizando Context API para gerenciamento de estado e Ant Design para a interface. O carregamento de dados será visualizado através de Skeletons.

**Tech Stack:** React 19, TypeScript, Ant Design 5, React Router 7, Dayjs, Vite.

## Global Constraints
- Nomes de arquivos seguindo o padrão kebab-case/dot-notation (ex: `list-people.service.ts`).
- Uso obrigatório de `antd.App` para notificações e modais.
- Skeletons em todas as listagens assíncronas.
- Seguir o contrato do `API.md`.

---

### Task 1: Infraestrutura do Domínio Person

**Objetivo:** Criar os tipos, serviços de API e o Context Provider para a entidade Pessoa.

**Files:**
- Create: `client/src/domain/person/person.type.ts`
- Create: `client/src/domain/person/api/list-people.service.ts`
- Create: `client/src/domain/person/api/create-person.service.ts`
- Create: `client/src/domain/person/api/update-person.service.ts`
- Create: `client/src/domain/person/api/delete-person.service.ts`
- Create: `client/src/domain/person/People.context.tsx`

**Interfaces:**
- Produces: `Person.Model`, `usePeopleContext`, `listPeople`, `createPerson`, `updatePerson`, `deletePerson`.

- [ ] **Step 1: Criar types no domínio person**
```typescript
/** client/src/domain/person/person.type.ts */
export namespace Person {
    export interface Model {
        id: number;
        name: string;
        cpf: string;
        email: string;
        birth_date: string;
        created_at: string;
        updated_at: string | null;
        deleted_at: string | null;
    }

    export type Create = Pick<Model, 'name' | 'cpf' | 'email' | 'birth_date'>;
    export type Update = Create;
}
```

- [ ] **Step 2: Implementar serviços de API (list, create, update, delete)**
Seguir o padrão de retorno do `client/src/domain/record/api`. Exemplo para `list-people.service.ts`:
```typescript
import { list } from '@domain/@shared/api.helper';
import type { Person } from '../person.type';

export function listPeople() {
    return list<Person.Model[]>('/people');
}
```

- [ ] **Step 3: Criar o PeopleContextProvider**
Implementar o contexto que gerencia o estado `people` e `isLoading`, incluindo a função `fetchPeople`.

**Validação:** Executar `npm run lint:tsc` para garantir integridade dos tipos.

---

### Task 2: Página de Pessoas e Navegação

**Objetivo:** Adicionar a rota, item de menu e a listagem inicial de pessoas com Skeletons.

**Files:**
- Modify: `client/src/router.tsx`
- Modify: `client/src/MainLayout.tsx`
- Create: `client/src/pages/People.page.tsx`
- Create: `client/src/domain/person/components/PeopleTable.tsx`

- [ ] **Step 1: Registrar nova rota /people no router.tsx**
- [ ] **Step 2: Adicionar link "Pessoas" no MainLayout.tsx com ícone UserOutlined**
- [ ] **Step 3: Implementar PeopleTable com Skeleton**
Se `isLoading` for true, renderizar `antd.Skeleton` simulando as linhas da tabela.
- [ ] **Step 4: Criar People.page.tsx integrando o PeopleContextProvider**

**Validação Manual:** Navegar até `/people`, verificar se o menu funciona e ver o estado de carregamento exibindo skeletons antes da tabela.

---

### Task 3: CRUD de Pessoas (Modais e Formulários)

**Objetivo:** Implementar a criação, edição e exclusão de pessoas.

**Files:**
- Create: `client/src/domain/person/components/PersonFields.tsx`
- Create: `client/src/domain/person/components/PersonModal.tsx`
- Modify: `client/src/pages/People.page.tsx` (Adicionar botões e modais)

- [ ] **Step 1: Criar campos do formulário (PersonFields)**
Campos: Nome completo, CPF (com máscara simple), E-mail e Data de Nascimento (DatePicker).
- [ ] **Step 2: Implementar PersonModal para Create e Edit**
- [ ] **Step 3: Integrar exclusão com confirmação (app.modal.confirm)**

**Validação Manual:**
1. Cadastrar nova pessoa -> Verificar se aparece na lista.
2. Tentar cadastrar CPF duplicado -> Verificar notificação de erro 409.
3. Editar e Excluir -> Verificar atualizações na lista.

---

### Task 4: Domínio de Envolvimento e Identificador de Anonimato

**Objetivo:** Criar a infraestrutura de vínculos e expor visualmente o status de anonimato nos relatos.

**Files:**
- Create: `client/src/domain/involvement/involvement.type.ts`
- Create: `client/src/domain/involvement/api/list-involvements.service.ts`
- Create: `client/src/domain/involvement/api/create-involvement.service.ts`
- Create: `client/src/domain/involvement/api/delete-involvement.service.ts`
- Modify: `client/src/pages/Records.page.tsx` (Adicionar coluna "Anonimato" ou Tag)

- [ ] **Step 1: Implementar tipos e serviços de Involvement conforme API.md**
O retorno de `listInvolvements` inclui `is_anonymous` e a lista de `involvements`.
- [ ] **Step 2: Atualizar tabela de Relatos**
Deverá mostrar de forma clara ("Anônimo" em vermelho ou "Identificado" em azul) o status. *Dica: Precisaremos de um serviço que busque o status para cada relato ou atualizar o model de Record se a API suportar (verificar API.md).*

**Validação:** Ver se a TAG de anonimato aparece corretamente na listagem de relatos.

---

### Task 5: Gestão de Envolvidos no Modal do Relato

**Objetivo:** Integrar a gestão de vínculos dentro do fluxo de edição do relato usando Abas.

**Files:**
- Modify: `client/src/domain/record/components/EditRecordModal.tsx`
- Create: `client/src/domain/involvement/components/InvolvementTab.tsx`
- Create: `client/src/domain/involvement/components/LinkInvolvementModal.tsx`

- [ ] **Step 1: Refatorar EditRecordModal para usar antd.Tabs**
  - Aba 1: Dados do Relato (Conteúdo original).
  - Aba 2: Envolvidos.
- [ ] **Step 2: Implementar InvolvementTab**
Exibe a listagem de envolvidos atuais e o botão "Vincular Pessoa".
- [ ] **Step 3: Implementar LinkInvolvementModal**
Formulário com Select (searchable) para selecionar a Pessoa e Select para o Tipo (whistleblower, witness, etc).
- [ ] **Step 4: Implementar remoção de vínculo**

**Validação Manual:**
1. Abrir edição de um relato.
2. Ir na aba Envolvidos.
3. Vincular uma pessoa como `witness`.
4. Verificar se a lista atualiza.
5. Remover um vínculo e verificar se o status de anonimato do relato muda (se afetar o `whistleblower`).

---

### Task 6: Polimento e Skeletons de Lista

**Objetivo:** Garantir que a listagem de envolvidos dentro do modal também utilize Skeletons e refinamento geral.

- [ ] **Step 1: Adicionar Skeletons na Inbox de Envolvidos**
- [ ] **Step 2: Revisar mensagens de erro 409 (Duplicidade de vínculo)**

**Checklist Final:**
- [ ] Menu "Pessoas" funcional.
- [ ] CRUD de Pessoas completo com CPF único.
- [ ] Relatos indicam anonimato.
- [ ] Involvido pode ser gerenciado dentro do modal do relato.
- [ ] Layout não "pula" durante carregamento (Skeletons aplicados).
