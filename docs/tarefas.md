# Catálogo de Tarefas e Implementações

Este documento descreve os **Tipos de Tarefa** atualmente implementados na interface React da plataforma e lista o catálogo completo das **50 tarefas predefinidas** no sistema, indicando em quais etapas elas podem ser inseridas.

---

## 1. Tipos de Tarefas Implementados (UI)

Cada tarefa configurada em [process_tasks.json](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_tasks.json) possui um `task_type`. A interface do usuário renderiza o componente apropriado através do orquestrador [TaskRenderer.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/TaskRenderer.jsx).

Abaixo estão descritos os 9 tipos de tarefas e seus respectivos arquivos de componente:

### 📄 Formulário (`form`)
- **Componente**: [FormTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/FormTask.jsx)
- **Objetivo**: Renderiza um formulário dinâmico configurado no banco de dados com base na propriedade `form_id`.
- **Exemplo**: "Dados Gerais" (`form_id: 1`) ou "Definir Laboratório Líder" (`form_id: 3`).

### 📤 Upload de Documento (`document_upload`)
- **Componente**: [UploadTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/UploadTask.jsx)
- **Objetivo**: Permite o envio de arquivos PDF/planilhas que dão suporte técnico àquela etapa.
- **Exemplo**: "Upload do Relatório de Treinamento" ou "Enviar Protocolo Padronizado".

### 📋 Resumo do Formulário (`form_summary`)
- **Componente**: [FormSummaryTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/FormSummaryTask.jsx)
- **Objetivo**: Apresenta uma visão consolidada de todas as respostas submetidas anteriormente no processo para revisão antes da submissão oficial.
- **Exemplo**: "Resumo e Submissão".

### 🤖 Avaliação IA (`ai_review`)
- **Componente**: [AIReviewTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/AIReviewTask.jsx)
- **Objetivo**: Executa uma verificação automatizada sobre os dados submetidos pelo proponente usando regras pré-definidas (por exemplo, tamanho mínimo do texto ou presença de palavras-chave).
- **Exemplo**: "Avaliação IA".

### ⚖️ Aprovação / Decisão (`approval`)
- **Componente**: [ApprovalTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/ApprovalTask.jsx)
- **Objetivo**: Uma tarefa com poder de decisão onde um revisor (ex: Coordenador do Grupo Gestor) aprova a etapa e avança o processo ou rejeita, retornando o fluxo para ajustes.
- **Exemplo**: "Aprovação BRACVAM" ou "Aprovação do Planejamento".

### 👥 Atribuição de Participantes (`participant_assignment`)
- **Componente**: [ParticipantAssignmentTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/ParticipantAssignmentTask.jsx)
- **Objetivo**: Permite associar usuários da plataforma a papéis específicos no processo com base na propriedade `target_role_id`.
- **Exemplo**: "Definir Patrocinador" ou "Definir Integrantes do Grupo Gestor".

### 🤝 Confirmação / Ciente (`acknowledgement`)
- **Componente**: [AcknowledgementTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/AcknowledgementTask.jsx)
- **Objetivo**: Tarefa informativa simples onde o usuário deve ler as orientações e clicar em um botão de confirmação ("Dar ciente" ou "Confirmar recebimento").
- **Exemplo**: "Confirmar Recebimento da Codificação".

### 📥 Download de Documento (`document_download`)
- **Componente**: [DocumentDownloadTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/DocumentDownloadTask.jsx)
- **Objetivo**: Disponibiliza arquivos e modelos gerados em etapas anteriores para download pelo usuário responsável.
- **Exemplo**: "Download do Template".

### 📊 Submissão de Dataset (`dataset_submission`)
- **Componente**: [DatasetSubmissionTask.jsx](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/components/tasks/DatasetSubmissionTask.jsx)
- **Objetivo**: Upload de arquivos de dados científicos tabulares (datasets) estruturados para consolidação estatística.
- **Exemplo**: "Submeter Resultados Experimentais".

---

## 2. Catálogo de Tarefas Disponíveis

O sistema atualmente possui **50 tarefas** pré-configuradas em [process_tasks.json](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_tasks.json). Abaixo elas estão catalogadas por sua etapa padrão:

### Etapa 1: Submissão e Triagem
| ID | Nome da Tarefa | Tipo | Dependências (`depends_on`) | Objetivo |
| :--- | :--- | :---: | :---: | :--- |
| **1** | Dados Gerais | `form` | Nenhuma | Coleta inicial do nome do método e objetivos principais. |
| **2** | Documentação | `document_upload` | `[1]` | Upload de documentos anexos de suporte à submissão. |
| **3** | Resumo e Submissão | `form_summary` | `[2]` | Visualização de sumário e gatilho de submissão do processo. |
| **4** | Avaliação IA | `ai_review` | `[3]` | Validação inteligente automática com base em regras de texto. |
| **5** | Aprovação BRACVAM | `approval` | `[4]` | Parecer técnico inicial da BRACVAM sobre a viabilidade. |

### Etapa 2: Planejamento
| ID | Nome da Tarefa | Tipo | Dependências (`depends_on`) | Objetivo |
| :--- | :--- | :---: | :---: | :--- |
| **6** | Definir Patrocinador | `participant_assignment` | Nenhuma | Atribuição do usuário patrocinador do estudo. |
| **7** | Definir Integrantes do Grupo Gestor | `participant_assignment` | `[6]` | Associação de membros do Grupo Gestor. |
| **8** | Definir Coordenador do Grupo Gestor | `participant_assignment` | `[7]` | Atribuição do líder da coordenação do Grupo Gestor. |
| **9** | Cadastrar Grupo Colaborador / Observador | `form` | `[8]` | Informações dos grupos observadores e colaboradores. |
| **10** | Definir Laboratório Líder | `form` | `[8]` | Detalhamento sobre a infraestrutura do Laboratório Líder. |
| **11** | Definir Laboratórios Participantes | `form` | `[10]` | Cadastro de outras instituições cooperantes no estudo. |
| **12** | Definir Grupo de Seleção de Amostras | `form` | `[8]` | Detalhamento dos responsáveis pela coleta/preparo de amostras. |
| **13** | Definir Estatístico Responsável | `form` | `[8]` | Cadastro do profissional de estatística responsável pelo plano. |
| **14** | Cadastrar Desenho do Estudo | `form` | `[8]` | Definição metodológica do estudo de validação. |
| **15** | Definir Desfecho Principal | `form` | `[14]` | Cadastro da variável de eficácia/toxicidade primária. |
| **16** | Enviar Protocolo Padronizado | `document_upload` | `[14]` | Envio do PDF contendo o protocolo detalhado do ensaio. |
| **17** | Definir Estratégia de Codificação das Amostras | `form` | `[12]` | Definição da lógica de teste cego nas amostras. |
| **18** | Definir Distribuição das Amostras | `form` | `[17]` | Logística de transporte e conservação das amostras. |
| **19** | Definir Procedimento de Coleta de Dados | `form` | `[14]` | Formulários e sistemas para registro de resultados. |
| **20** | Definir Critérios de Aceitação | `form` | `[14]` | Parâmetros de reprodutibilidade e conformidade. |
| **21** | Definir Plano Estatístico | `form` | `[13]` | Descrição das metodologias matemáticas de análise de dados. |
| **22** | Mapear Possibilidades de Erro | `form` | `[14]` | Matriz de riscos e ações mitigadoras na execução. |
| **23** | Definir Cronograma Macro | `form` | `[8]` | Datas estimadas para todas as sub-atividades de execução. |
| **24** | Indicar Especialistas Temáticos | `form` | `[8]` | Cadastro de revisores ad-hoc para pareceres. |
| **25** | Registrar Confidencialidade | `form` | `[8]` | Cadastro de acordos de não-divulgação assinados. |
| **26** | Aprovação do Planejamento | `approval` | `[9, 11, 12, 13, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25]` | Parecer técnico e aprovação do plano pelo Coordenador. |

### Etapa 3: Execução da Validação
| ID | Nome da Tarefa | Tipo | Dependências (`depends_on`) | Objetivo |
| :--- | :--- | :---: | :---: | :--- |
| **27** | Disponibilizar Codificação Cega | `document_upload` | Nenhuma | Envio da planilha com chaves e códigos de amostras cegadas. |
| **28** | Confirmar Recebimento da Codificação | `acknowledgement` | `[27]` | Confirmação de recebimento da codificação pelo laboratório. |
| **29** | Upload do Relatório de Treinamento | `document_upload` | Nenhuma | Comprovação técnica do treinamento prévio das equipes. |
| **30** | Disponibilizar Template de Resultados | `document_upload` | Nenhuma | Planilha padrão que os laboratórios devem usar para dados. |
| **31** | Download do Template | `document_download` | `[30]` | Download do modelo da planilha de resultados. |
| **32** | Submeter Resultados Experimentais | `dataset_submission` | `[31]` | Envio dos datasets com resultados brutos dos ensaios. |
| **33** | Relatar Problemas ou Desvios | `form` | Nenhuma | Registro de problemas que possam impactar na validação. |
| **34** | Registrar Material Remanescente | `form` | `[32]` | Inventário de amostras e reagentes não consumidos. |
| **35** | Confirmar Devolução do Material | `acknowledgement` | `[34]` | Acordo de encerramento de posse dos reagentes do estudo. |
| **36** | Encerrar Execução Experimental | `approval` | `[28, 29, 32, 33, 35]` | Declaração oficial do encerramento da fase experimental. |

### Etapa 4: Revisão e decisão
| ID | Nome da Tarefa | Tipo | Dependências (`depends_on`) | Objetivo |
| :--- | :--- | :---: | :---: | :--- |
| **37** | Consolidação dos Dados | `acknowledgement` | Nenhuma | Início do processo de consolidação de datasets. |
| **38** | Upload dos Dados Consolidados | `document_upload` | `[37]` | Envio do banco de dados consolidado sem codificação cega. |
| **39** | Download dos Dados Consolidados | `document_download` | `[38]` | Download do banco consolidado pelo estatístico de dados. |
| **40** | Envio do Relatório Estatístico | `document_upload` | `[39]` | Envio da análise matemática sobre a eficácia/toxicidade. |
| **41** | Montagem do Dossiê | `acknowledgement` | `[40]` | Montagem do compilado com dados e pareceres estatísticos. |
| **42** | Upload do Dossiê Consolidado | `document_upload` | `[41]` | Envio do documento final do dossiê de validação técnica. |
| **43** | Download do Dossiê | `document_download` | `[42]` | Download do dossiê técnico completo pelo comitê. |
| **44** | Submissão do Parecer | `form` | `[43]` | Cadastro de pareceres individuais de especialistas do conselho. |
| **45** | Registro da Reunião de Pareceres | `document_upload` | `[44]` | Upload da ata contendo a decisão coletiva do comitê. |
| **46** | Consolidação das Avaliações | `document_upload` | `[45]` | Upload do parecer consolidado baseado na ata da reunião. |
| **47** | Emissão do Parecer Conclusivo | `document_upload` | `[46]` | Envio do relatório final de homologação técnica. |
| **48** | Registro de Aprovação Institucional | `document_upload` | `[47]` | Documento oficial de homologação institucional/governamental. |
| **49** | Inclusão em Base Oficial | `approval` | `[48]` | Transição do método aprovado para a base de métodos oficiais. |
| **50** | Notificação de Encerramento | `acknowledgement` | `[49]` | Encerramento de todas as ações de fluxo e notificação do proponente. |

---

## 3. Flexibilidade e Reuso de Tarefas nas Etapas

Como o sistema utiliza um modelo altamente desacoplado, **as tarefas listadas acima não são rígidas de uma única etapa**. Elas podem ser anexadas a qualquer etapa alterando-se as configurações no JSON.

### Como anexar uma tarefa existente a uma etapa diferente:
1. Abra o arquivo de configuração de tarefas: [process_tasks.json](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_tasks.json).
2. Adicione ou edite uma entrada definindo:
   - `stage_id`: O identificador da etapa para a qual a tarefa deve ir.
   - `depends_on`: As dependências de tarefas que determinam o seu desbloqueio (mesmo que pertençam a outras etapas).
   - `viewer_roles`, `editor_roles` e `approver_roles`: Os privilégios de acesso específicos para essa nova etapa.
   - Se for do tipo `form`, aponte para o `form_id` correto que define os campos do formulário no arquivo [forms.json](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/forms.json).

> [!TIP]
> Tarefas genéricas como Upload de Documentos (`document_upload`), Confirmações (`acknowledgement`) e Formulários de Cadastro (`form`) são facilmente reutilizáveis em múltiplos momentos do fluxo de trabalho simplesmente instanciando novos objetos com as referências corretas.
