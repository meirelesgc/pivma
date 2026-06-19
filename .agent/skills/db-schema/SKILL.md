---
name: db-schema
description: Guarda o schema e a modelagem do banco de dados em memória do projeto
---

# Schema do Banco de Dados em Memória (PIVMA)

Este documento descreve as tabelas simuladas em arquivos JSON localizados em `src/data/mock/`. Elas modelam a base de dados em memória do projeto PIVMA (Plataforma Integrada de Validação de Métodos Alternativos).

---

## Tabelas e Estruturas

### 1. Usuários (`users.json`)
* **Caminho:** `src/data/mock/users.json`
* **Descrição:** Armazena as informações dos usuários cadastrados na plataforma.
* **Schema:**
  * `id` (`number`): Identificador único do usuário.
  * `name` (`string`): Nome completo do usuário.
  * `email` (`string`): Endereço de e-mail do usuário.
  * `system_role` (`string`): Papel de permissão no sistema (ex: `'default'`, `'admin'`).

### 2. Processos Disponíveis (`available_processes.json`)
* **Caminho:** `src/data/mock/available_processes.json`
* **Descrição:** Define os fluxos de processos de validação de métodos alternativos disponíveis.
* **Schema:**
  * `id` (`number`): Identificador único do processo de validação.
  * `name` (`string`): Nome descritivo do fluxo do processo (ex: `"Desenvolvido (Validação Pendente)"`).

### 3. Instâncias de Processos (`process_instances.json`)
* **Caminho:** `src/data/mock/process_instances.json`
* **Descrição:** Guarda as instâncias de validação que foram iniciadas a partir de um processo disponível.
* **Schema:**
  * `id` (`number`): Identificador único da instância de processo.
  * `process_id` (`number`): ID do processo base (referência a [available_processes.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/available_processes.json)).
  * `created_by` (`number`): ID do usuário que criou/iniciou o processo (referência a [users.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/users.json)).
  * `createdAt` (`string`): Data e hora de criação da instância no formato ISO timestamp.

### 4. Etapas do Processo (`process_steps.json`)
* **Caminho:** `src/data/mock/process_steps.json`
* **Descrição:** Etapas predefinidas do fluxo de um processo (etapas estáticas).
* **Schema:**
  * `id` (`number`): Identificador único da etapa.
  * `process_id` (`number`): ID do processo ao qual a etapa pertence (referência a [available_processes.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/available_processes.json)).
  * `name` (`string`): Nome da etapa (ex: `"SUBMISSÃO E TRIAGEM"`, `"PLANEJAMENTO"`).
  * `sequence` (`number`): Sequência/ordem de execução dentro do processo.
  * `icone` (`string`): Nome do ícone da biblioteca Lucide a ser renderizado na interface.

### 5. Instâncias de Etapas (`process_instance_steps.json`)
* **Caminho:** `src/data/mock/process_instance_steps.json`
* **Descrição:** Rastreia o progresso e conclusão das etapas para cada instância de processo ativa.
* **Schema:**
  * `id` (`number`): Identificador único do registro de progresso.
  * `process_instance_id` (`number`): ID da instância do processo (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `step_id` (`number`): ID da etapa de processo correspondente (referência a [process_steps.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_steps.json)).
  * `is_completed` (`boolean`): Flag que indica se a etapa da instância foi concluída.

### 6. Definições de Tarefas (`tasks.json`)
* **Caminho:** `src/data/mock/tasks.json`
* **Descrição:** Tarefas estáticas predefinidas que devem ser cumpridas para que uma etapa seja considerada completa.
* **Schema:**
  * `id` (`number`): Identificador único da tarefa.
  * `step_id` (`number`): ID da etapa à qual a tarefa pertence (referência a [process_steps.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_steps.json)).
  * `name` (`string`): Nome/título descritivo da tarefa.
  * `type` (`string`): Tipo da tarefa (ex: `'form'`, `'assign_roles'`).
  * `required_reviewers` (`array` de `string`): Papéis que obrigatoriamente revisarão o formulário (ex: `["bracvam"]`).
  * `role` (`string`): Papel responsável por preencher/executar a tarefa (ex: `"Proponente"`).

### 7. Instâncias de Tarefas (`process_instance_tasks.json`)
* **Caminho:** `src/data/mock/process_instance_tasks.json`
* **Descrição:** Rastreia o estado dinâmico de conclusão, revisão e edição das tarefas em execução de uma instância de processo.
* **Schema:**
  * `id` (`number`): Identificador único da tarefa instanciada.
  * `process_instance_id` (`number`): ID da instância do processo (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `process_instance_step_id` (`number`): ID da instância da etapa (referência a [process_instance_steps.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instance_steps.json)).
  * `task_id` (`number`): ID da tarefa base (referência a [tasks.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/tasks.json)).
  * `is_completed` (`boolean`): Flag que indica se a tarefa foi concluída.
  * `status` (`string`): Estado atual da tarefa (ex: `'completed'`, `'pending_submission'`, `'pending'`, `'in_review'`).
  * `current_reviewer_role` (`string` ou `null`): Papel do revisor atual da rodada.
  * `current_review_round_id` (`number` ou `null`): Rodada atual de revisão.
  * `editable` (`boolean`): Flag que indica se a tarefa ainda está aberta para edição/envio de respostas.

### 8. Papéis nas Instâncias (`process_instance_roles.json`)
* **Caminho:** `src/data/mock/process_instance_roles.json`
* **Descrição:** Associa usuários a papéis específicos dentro do contexto de uma instância de processo.
* **Schema:**
  * `id` (`number`): Identificador único da associação.
  * `instance_id` (`number`): ID da instância do processo (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `user_id` (`number`): ID do usuário associado (referência a [users.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/users.json)).
  * `role` (`string`): Papel designado ao usuário para esta instância (ex: `"Proponente"`, `"BraCVAM"`, `"Laboratório Coordenador"`, `"Laboratório Colaborador"`, `"Estatístico"`).

### 9. Campos de Formulário (`form_fields.json`)
* **Caminho:** `src/data/mock/form_fields.json`
* **Descrição:** Define as perguntas/campos dos formulários dinâmicos preenchidos em tarefas de tipo `'form'`.
* **Schema:**
  * `id` (`number`): Identificador único do campo do formulário.
  * `task_id` (`number`): ID da tarefa associada (referência a [tasks.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/tasks.json)).
  * `name` (`string`): Nome/Pergunta do campo.
  * `type` (`string`): Tipo do campo de entrada (ex: `'text'`, `'textarea'`, `'select'`, `'number'`, `'file'`).
  * `section` (`string`): Agrupador visual de seções na UI (ex: `"1. Identificação"`, `"2. Resumo"`).

### 10. Respostas de Formulário (`form_answers.json`)
* **Caminho:** `src/data/mock/form_answers.json`
* **Descrição:** Guarda os dados submetidos pelo proponente para os formulários de cada tarefa.
* **Schema:** Dicionário estruturado onde a chave principal é a string de `process_instance_task_id` (ex: `"1"`).
  * O valor correspondente é um objeto que mapeia a string de `field_id` para seu valor correspondente enviado (ex: `"1": "Método de Teste de Barreira Cutânea"`, `"5": "pop_v1.pdf"`).

### 11. Revisões de Campos (`field_reviews.json`)
* **Caminho:** `src/data/mock/field_reviews.json`
* **Descrição:** Armazena feedbacks, apontamentos ou correções feitos por revisores humanos (BraCVAM, etc.) ou validadores de Inteligência Artificial para cada campo.
* **Schema:**
  * `id` (`number`): Identificador único da revisão.
  * `process_instance_id` (`number`): ID da instância de processo (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `review_round_id` (`number`): Número da rodada de revisão.
  * `field_id` (`number`): ID do campo que possui o apontamento (referência a [form_fields.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/form_fields.json)).
  * `reviewer_role` (`string`): Papel do revisor que registrou o apontamento (ex: `'ia'`, `'bracvam'`).
  * `comment` (`string`): Feedback textual ou motivo da recusa/correção solicitada.
  * `status` (`string`): Estado atual do apontamento (ex: `'active'`, `'resolved'`).

### 12. Definições de Amostras (`sample_definitions.json`)
* **Caminho:** `src/data/mock/sample_definitions.json`
* **Descrição:** Registra a caracterização física e química de substâncias e amostras utilizadas nos testes interlaboratoriais de validação.
* **Schema:**
  * `id` (`number`): Identificador único da amostra.
  * `process_instance_id` (`number`): ID da instância (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `chemical_name` (`string`): Nome químico ou comercial da substância.
  * `casrn` (`string`): Registro CAS (Chemical Abstracts Service Registry Number).
  * `chemical_class` (`array` de `string`): Classes químicas às quais a substância pertence.
  * `product_class` (`array` de `string`): Classes de produto recomendadas.
  * `appearance` (`string`): Descrição visual/aparência física da amostra.
  * `physical_state` (`string`): Estado físico (ex: `'Líquido'`, `'Sólido'`).
  * `quantity` (`number`): Quantidade disponível.
  * `unit` (`string`): Unidade de medida da quantidade (ex: `'ml'`, `'g'`).
  * `ph` (`number`): Valor do pH medido.
  * `kow` (`number`): Coeficiente de partição Octanol-Água.
  * `volatility` (`string`): Nível de volatilidade.
  * `reactivity` (`string`): Nível de reatividade/estabilidade.
  * `test_concentrations` (`array` de `string`): Concentrações em que o teste será realizado.
  * `purity_percentage` (`number`): Percentual de pureza.
  * `supplier` (`string`): Empresa fornecedora da amostra.
  * `storage_instructions` (`string`): Cuidados no armazenamento (ex: "Manter sob refrigeração").
  * `handling_instructions` (`string`): Equipamentos de Proteção Individual (EPIs) e manuseio.
  * `disposal_instructions` (`string`): Protocolos de descarte.
  * `components` (`array` de `object`): Componentes da mistura (caso não seja substância pura).
  * `sds_file` (`string`): Nome do arquivo físico da FISPQ/FDS correspondente.
  * `sds_url` (`string`): Caminho/URL local para download do documento FDS.

### 13. Códigos Cegos de Amostras (`sample_blind_codes.json`)
* **Caminho:** `src/data/mock/sample_blind_codes.json`
* **Descrição:** Associa um código cego para cada amostra de forma a preservar o segredo interlaboratorial durante os ensaios duplo-cegos.
* **Schema:**
  * `id` (`number`): Identificador único do código cego.
  * `process_instance_id` (`number`): ID da instância (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `sample_id` (`number`): ID da definição da amostra (referência a [sample_definitions.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/sample_definitions.json)).
  * `laboratory_role_id` (`number`): ID do papel do laboratório designado para receber a amostra correspondente (referência a [process_instance_roles.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instance_roles.json)).
  * `blind_code` (`string`): Código encoberto gerado para o ensaio (ex: `"XR-3921-K"`).

### 14. Templates de Dados (`data_templates.json`)
* **Caminho:** `src/data/mock/data_templates.json`
* **Descrição:** Define as configurações globais das planilhas de resultados que serão submetidas pelos laboratórios na validação interlaboratorial.
* **Schema:**
  * `id` (`number`): Identificador único do template de dados.
  * `process_instance_id` (`number`): ID da instância do processo (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `name` (`string`): Nome do template de dados.
  * `description` (`string`): Descrição do propósito da planilha.
  * `allow_failed_runs` (`boolean`): Configuração indicando se corridas inválidas/com falha são registradas.
  * `replicate_configuration` (`object`): Metadados de amostragem e réplicas por laboratório, ex:
    * `experiments_per_lab` (`number`): Quantidade de experimentos independentes por laboratório.
    * `replicates_per_experiment` (`number`): Quantidade de réplicas técnicas por experimento.

### 15. Colunas do Template de Dados (`data_template_columns.json`)
* **Caminho:** `src/data/mock/data_template_columns.json`
* **Descrição:** Especifica a tipagem e restrições de cada coluna da planilha definida em um template de dados.
* **Schema:**
  * `id` (`number`): Identificador único do campo/coluna.
  * `template_id` (`number`): ID do template associado (referência a [data_templates.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/data_templates.json)).
  * `name` (`string`): Nome interno/Slug da coluna na base de dados.
  * `label` (`string`): Rótulo legível para exibição visual nas planilhas.
  * `type` (`string`): Tipo de entrada (ex: `'text'`, `'number'`).
  * `required` (`boolean`): Indica se o valor é obrigatório.
  * `position` (`number`): Índice posicional da coluna da esquerda para a direita.
  * `is_raw_data` (`boolean`): Indica se o valor é um dado primário/bruto digitado pelos laboratórios.
  * `is_derived_data` (`boolean`): Indica se é calculado dinamicamente com base em outras colunas.
  * `source_columns` (`array` de `string`): Colunas de origem utilizadas para calcular as fórmulas de derivação.

### 16. Logs de Auditoria (`audit_logs.json`)
* **Caminho:** `src/data/mock/audit_logs.json`
* **Descrição:** Mantém a trilha de auditoria e ações importantes que ocorreram na instância do processo para fins de reprodutibilidade e conformidade regulatória.
* **Schema:**
  * `id` (`number`): Identificador único do log.
  * `process_instance_id` (`number`): ID da instância onde a ação ocorreu (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `user_id` (`number`): ID do usuário realizador (referência a [users.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/users.json) ou `0` para ações automatizadas da plataforma/IA).
  * `user_name` (`string`): Nome do usuário executor.
  * `user_email` (`string`): E-mail do usuário executor.
  * `action` (`string`): Título/Ação efetuada (ex: `"Criar Método"`).
  * `description` (`string`): Detalhamento legível da ação realizada.
  * `where_context` (`string`): Identificação da etapa do fluxo no momento do registro.
  * `timestamp` (`string`): Carimbo de data/hora ISO de realização do evento.

### 17. Convites Pendentes (`pending_invites.json`)
* **Caminho:** `src/data/mock/pending_invites.json`
* **Descrição:** Armazena convites enviados a e-mails de usuários convidados a integrar uma instância de validação que ainda não possuem cadastro na plataforma.
* **Schema:**
  * `id` (`number`): Identificador único do convite.
  * `process_instance_id` (`number`): ID da instância (referência a [process_instances.id](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock/process_instances.json)).
  * `email` (`string`): E-mail do usuário convidado.
  * `target_role` (`string`): Papel planejado a ser associado assim que o usuário se cadastrar (ex: `'Laboratório Coordenador'`, `'Laboratório Colaborador'`).
  * `status` (`string`): Status do convite (ex: `'sent'`, `'accepted'`).