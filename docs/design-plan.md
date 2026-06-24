# Plano de Design: Pessoas e Envolvimentos

## 1. Objetivo
Estruturar o cadastro centralizado de pessoas e permitir o vínculo destas aos relatos com papéis específicos (relatante, testemunha, vítima, denunciado), aumentando a rastreabilidade e fornecendo clareza sobre o anonimato dos relatos.

## 2. Entendimento do PRD
O sistema expande para incluir a entidade "Pessoa", transversal a toda a plataforma. O foco está na garantia de unicidade (CPF) e no enriquecimento dos relatos com dados de envolvidos, apoiando diretamente o processo de investigação.

## 3. Requisitos Funcionais

### Épico 1: Pessoa
- **Listagem**: Tabela com todas as pessoas cadastradas.
- **Cadastro**: Formulário para Nome, CPF, E-mail e Data de Nascimento.
- **Unicidade**: Impedir CPFs duplicados (validação via API 409).
- **Persistência**: Edição e exclusão de cadastros existentes.

### Épico 2: Envolvimento
- **Vínculo**: Seção dentro da edição do Relato para associar Pessoas com um Tipo (Relatante, Testemunha, Vítima, Denunciado).
- **Gestão de Anonimato**: Identificação automática de relato "Anônimo" se não houver um "Relatante" vinculado.
- **Restrição**: Cada pessoa pode ser vinculada apenas uma vez ao mesmo relato.

## 4. Requisitos Não Funcionais
- **UX Premium**: Uso de Ant Design (antd) para consistência visual.
- **Estados de Carregamento**: Utilização de **Skeletons** em vez de Spinners para manter a estabilidade do layout durante o carregamento de dados em tabelas.
- **Feedback**: Notificações (Toasts) claras para erros de negócio como CPF duplicado.

## 5. Fluxos de Usuário
1.  **Gestão de Pessoas**: Menu Lateral -> Pessoas -> Visualização de Tabela -> Cadastro/Edição via Modal.
2.  **Gestão de Envolvidos**: Menu Lateral -> Relatos -> Editar (Modal) -> Aba Envolvidos -> Adicionar Vínculo -> Pesquisar Pessoa (Select com busca) -> Escolher Tipo.
3.  **Identificação Visual**: Na lista de Relatos, exibir badge ou coluna indicando se o relato é "Anônimo" ou "Identificado".

## 6. Arquitetura Proposta
Seguiremos o padrão modular da aplicação:
- `src/domain/person`: Lógica de negócio, API e Context Provider para Pessoas.
- `src/domain/involvement`: Lógica de negócio, API e componentes de vínculo.
- `src/pages/People.page.tsx`: Nova página para gerenciar o diretório de pessoas.

## 7. Estrutura de Componentes
- `PeopleTable`: Componente de tabela que exibe Skeletons durante o carregamento.
- `PersonFormModal`: Modal compartilhado para criação e edição de pessoas.
- `RecordInvolvementsTab`: Aba de "Envolvidos" integrada ao `EditRecordModal`.
- `InvolvementItem`: Linha da lista de envolvidos com opção de remoção.

## 8. Estratégia de Gerenciamento de Estado
- **React Context**: Cada domínio terá seu próprio Provider (ex: `PeopleContextProvider`) para centralizar dados de API, estados de erro e de carregamento (`isLoading`).
- **Ant Design Form**: Uso do hook `Form.useForm()` para manipulação e validação de campos.

## 9. Estratégia de Consumo da API
- **Services**: Funções assíncronas em cada domínio seguindo o contrato:
  - `GET /people`, `POST /people`, etc.
  - `GET /records/{id}/involvements`, `POST /records/{id}/involvements`.
- **Helpers**: Uso do helper `handleServiceError` já existente para padronização de notificações.

## 10. Tratamento de Erros
- **Duplicidade**: Captura de status 409 (CPF ou vínculo duplicado) com mensagem amigável via `App.notification`.
- **Campos Obrigatórios**: Validação visual imediata no frontend via regras do antd Form.

## 11. Riscos e Mitigações
- **Complexidade do Modal de Relato**: O acréscimo de envolvidos pode poluir o modal. *Mitigação*: Uso de `Tabs` para separação lógica e organizada.
- **Performance de Busca**: Muitas pessoas podem atrasar o carregamento do Select. *Mitigação*: Implementar `showSearch` no `Select` para filtragem client-side eficiente nesta etapa.

## 12. Decisões Técnicas
- **UX de Carregamento**: Skeletons serão usados em todas as tabelas e listas de carregamento assíncrono.
- **Navegação**: Adição da rota `/people` no `router.tsx` e no menu principal em `MainLayout.tsx`.

## 13. Critérios de Aceite
- O usuário consegue cadastrar, editar e excluir pessoas.
- O sistema impede CPFs duplicados.
- Um relato exibe "Anônimo" se não tiver relatante.
- É possível vincular e desvincular pessoas de relatos sem fechar o modal de edição.
