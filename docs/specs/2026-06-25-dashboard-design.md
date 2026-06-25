# Design Doc: Dashboard Executivo Operacional

Este documento descreve o projeto do Dashboard para a plataforma Contato Seguro Slim, com foco em uma visão executiva e operacional.

## 1. Visão Geral
O Dashboard fornecerá ao membro do comitê uma visão consolidada de todos os relatos, empresas e pessoas no ecossistema, destacando gargalos na investigação e facilitando a tomada de decisão rápida.

## 2. Abordagem: "Command Center Operacional"
A solução foca em identificar onde o trabalho está "parado".

### 2.1 Métricas e KPIs
- **Total de Relatos**: Contagem absoluta da base.
- **Aguardando Investigação**: Volume de casos no estado inicial (Ponto Crítico).
- **Em Investigação**: Volume de casos em andamento.
- **Taxa de Resolução**: Porcentagem de casos finalizados (Resolved + Archived).

### 2.2 Visualizações
1. **Distribuição de Status (Donut Chart)**:
   - Proporção visual dos 4 estados de um relato.
2. **Ranking de Pendências por Empresa (Horizontal Bar Chart)**:
   - Ranking das 5 a 10 empresas com maior volume de relatos não finalizados.
3. **Frequência de Envolvimentos (Calculado)**:
   - Insights sobre o tipo de envolvimento mais comum para ajudar a entender o perfil dos casos.
4. **Tabela de Relatos Críticos**:
   - Listagem rápida dos 5 últimos relatos "Aguardando Investigação".

## 3. Arquitetura Técnica

### 3.1 Biblioteca de Visualização
- **Escolha**: `@ant-design/plots` (v2).
- **Justificativa**:
  - Consistência estética total com o Ant Design v5 utilizado no projeto.
  - Conjunto rico de interações (tooltips, legendas interativas).
  - Facilidade de implementação através de componentes React declarativos.
- **Trade-offs**: Aumento do bundle size (compensado pela qualidade visual e interatividade em ambiente corporativo).

### 3.2 Fluxo de Dados
O Dashboard será um "pure consumer" dos contextos globais:
- `RecordsContext`
- `CompaniesContext`
- `PeopleContext`

Não haverá novas rotas de API específicas para o Dashboard nesta fase, utilizando agregação client-side via `useMemo` para garantir reatividade e performance.

### 3.3 Componentes
- `DashboardPage.tsx`: Container principal.
- `MetricCard.tsx`: Reutilizável para KPIs.
- `StatusDonut.tsx`: Componente de gráfico de pizza/rosca.
- `CompanyRankingBar.tsx`: Componente de gráfico de barras.
- `InvestigationTable.tsx`: Versão simplificada da tabela de relatos.

## 4. UI/UX
- **Grid System**: 24 colunas (Ant Design).
- **Responsividade**: Mobile-friendly (cards empilhados em telas pequenas).
- **Loading State**: Utilização de `Skeleton` ou `Spin` enquanto os contextos carregam os dados iniciais.
- **Empty State**: Tratamento visual caso não existam relatos ou empresas cadastradas.

## 5. Cenários de Teste Sugeridos
1. **Dados Vazios**: Garantir que o Dashboard não quebre e mostre estados de "vazio" amigáveis.
2. **Performance**: Validar que a agregação client-side de 100+ relatos não cause "jank" no scroll.
3. **Navegação**: Clicar em um relato crítico na tabela do dashboard deve levar o usuário para a página de detalhes desse relato.

## 6. Evoluções Futuras (Out of Scope)
- Filtros temporais (Últimos 30 dias, 6 meses).
- Exportação de PDF com o resumo executivo.
- Evolução de volumetria ao longo do tempo (Gráfico de Linha).
