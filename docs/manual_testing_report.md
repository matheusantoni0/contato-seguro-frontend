# Relatório de Testes Manuais - Contato Seguro Slim

**Data de Emissão**: 25 de Junho de 2026  
**Status do Sistema**: Estável  
**Versão do Commit**: `8b8ea53`

---

## 1. Épico 1: Pessoa
[Assista ao vídeo](https://youtu.be/OGwqQQHVlk0)

| ID | Funcionalidade | Passos do Teste | Resultado Esperado | Resultado Real |
|:---|:---|:---|:---|:---|
| P1 | Cadastro de Nova Pessoa | 1. Navegar para "Pessoas"<br>2. Clicar em "Cadastrar"<br>3. Preencher todos os campos (Nome, CPF, Email, Data Nasc)<br>4. Salvar | A pessoa é criada e aparece instantaneamente na listagem. | ✅ Sucesso |
| P2 | Editar Pessoa Existente | 1. Navegar para "Pessoas"<br>2. Clicar no botão "Editar" ao lado de uma pessoa<br>3. Alterar os campos desejados<br>4. Salvar | As alterações são salvas e refletidas na listagem. | ✅ Sucesso |
| P3 | Validação de CPF Único | 1. Tentar cadastrar uma nova pessoa com um CPF já existente no sistema | O sistema exibe um erro de validação e impede o salvamento. | ✅ Sucesso |
| P4 | Exclusão de Pessoa | 1. Navegar para "Pessoas"<br>2. Clicar no botão "Excluir" ao lado de uma pessoa<br>3. Confirmar a exclusão | A pessoa é removida da listagem. | ✅ Sucesso |
| P5 | Consulta e Filtro | 1. Utilizar a barra de busca na página de pessoas | A lista é filtrada em tempo real por nome ou e-mail. | ✅ Sucesso |

## 2. Épico 2: Envolvimento
[Assista ao vídeo](https://youtu.be/Vw-2m-hG-ks)

| ID | Funcionalidade | Passos do Teste | Resultado Esperado | Resultado Real |
|:---|:---|:---|:---|:---|
| E1 | Cadastrar Relato | 1. Navegar para "Relatos"<br>2. Clicar em "Cadastrar"<br>3. Preencher todos os campos<br>4. Salvar | O relato é criado e aparece instantaneamente na listagem. | ✅ Sucesso |
| E2 | Editar um Relato Existente | 1. Navegar para "Relatos"<br>2. Clicar no botão "Editar" ao lado de um relato<br>3. Alterar os campos desejados<br>4. Salvar | As alterações são salvas e refletidas na listagem. | ✅ Sucesso |
| E3 | Tipos de Envolvimento | 1. Verificar opções no seletor de papel | Deve conter: Relatante, Testemunha, Vítima e Denunciado. | ✅ Sucesso |
| E4 | Identificação de Anonimato | 1. Visualizar um relato sem envolvido do tipo "Relatante"<br>2. Visualizar um com "Relatante" | O primeiro deve exibir tag/status "Anônimo" e o segundo "Identificado". | ✅ Sucesso |
| E5 | Restrição de Vínculo Único | 1. Tentar adicionar a mesma pessoa duas vezes no mesmo relato | O sistema impede a duplicação do vínculo para a mesma pessoa. | ✅ Sucesso |
| E6 | Excluir um Relato | 1. Navegar para "Relatos"<br>2. Clicar no botão "Excluir" ao lado de um relato<br>3. Confirmar a exclusão | O relato é removido da listagem. | ✅ Sucesso |
| E7 | Busca de Pessoas | 1. Abrir modal "Vincular Pessoa"<br>2. Pesquisar por nome parcial (ex: "Silva")<br>3. Pesquisar por CPF parcial<br>4. Pesquisar nome com acento usando texto sem acento (ex: "Jose" -> "José") | A lista exibe os resultados corretos em todos os cenários. | ✅ Sucesso |
| E8 | Atalho Cadastro Rápido | 1. Abrir modal "Vincular Pessoa"<br>2. Clicar em "+ Cadastrar nova pessoa" no dropdown<br>3. Finalizar cadastro<br>4. Verificar se a pessoa aparece na lista de seleção | O cadastro é concluído e a lista atualiza sem fechar o modal principal. | ✅ Sucesso |

## 3. Dashboard Operacional (Upgrade Visual)
[Assista ao vídeo](https://youtu.be/pWM_x7qsjvs)

| ID | Funcionalidade | Passos do Teste | Resultado Esperado | Resultado Real |
|:---|:---|:---|:---|:---|
| D1 | KPIs Principais | 1. Acessar o Dashboard<br>2. Validar totais de Relatos e Taxa de Resolução | As métricas refletem fielmente a soma dos dados do sistema. | ✅ Sucesso |
| D2 | Gráfico de Status | 1. Verificar gráfico de rosca | Exibe distribuição correta e o Total de Relatos no centro. | ✅ Sucesso |
| D3 | Ranking de Empresas | 1. Verificar gráfico de barras | Exibe as 5 empresas com mais pendências de investigação. | ✅ Sucesso |
| D4 | Tabela de Casos Críticos | 1. Localizar a tabela de relatos recentes<br>2. Clicar em "Acessar" | Abre o modal de edição para rápida tomada de decisão. | ✅ Sucesso |

## 4. Layout e Experiência do Usuário (UX)
[Assista ao vídeo](https://youtu.be/-wr07FASnKM)

| ID | Funcionalidade | Passos do Teste | Resultado Esperado | Resultado Real |
|:---|:---|:---|:---|:---|
| L1 | Sidebar Fixa | 1. Navegar por uma página longa (Dashboard ou Relatos)<br>2. Rolar a página para baixo | O menu lateral deve permanecer visível e fixo na tela. | ✅ Sucesso |
| L2 | Scroll Independente | 1. Rolar na área de conteúdo<br>2. Rolar na sidebar (se necessário) | Ambas as áreas possuem barras de rolagem próprias e independentes. | ✅ Sucesso |
| L3 | Footer Sticky | 1. Rolar até o final do conteúdo principal | O rodapé aparece fixado ao final do scroll, após os dados. | ✅ Sucesso |
| S1 | Performance de Busca | 1. Digitar rapidamente na busca global<br>2. Observar delay | A busca dispara após 300ms (debounce), sem causar lentidão. | ✅ Sucesso |

---

## 5. Cenários de Regressão e Responsividade
[Assista ao vídeo](https://youtu.be/1XzHERX47U4)

1.  **Empty States**: Validado que gráficos e tabelas exibem estados vazios amigáveis quando não há dados, sem erros de runtime.
2.  **Responsividade Mobile**: O grid do Dashboard se empilha verticalmente e a sidebar se ajusta corretamente em telas menores.
3.  **Persistência de Estado**: O item ativo no menu lateral permanece selecionado corretamente após o refresh da página ou troca de rotas.

---

**Notas Finais**: O sistema atende a todos os requisitos técnicos e de negócio do MINI_PRD, apresentando uma interface moderna, performática e orientada à produtividade do membro do comitê.
