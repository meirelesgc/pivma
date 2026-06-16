---
name: db-schema
description: Guarda o schema e a modelagem do banco de dados em memória do projeto
---

# Banco de Dados (Schema e Modelagem)

Este banco de dados opera em memória simulado por arquivos JSON no diretório de mocks.

---

## 1. users (Usuários)
* **Caminho:** `src/data/mock/users.json`
* **Campos:**
  * `id` (number): Identificador único do usuário.
  * `name` (string): Nome do usuário.
  * `email` (string): Endereço de e-mail do usuário.
  * `system_role` (string): Função do usuário no sistema (ex: "default", "admin").

---

## 2. available_processes (Processos Disponíveis)
* **Caminho:** `src/data/mock/available_processes.json`
* **Campos:**
  * `id` (number): Identificador único do tipo de processo.
  * `name` (string): Nome descritivo do tipo de processo (ex: "Desenvolvido (Validação Pendente)").

---

## 3. process_instances (Instâncias de Processos)
* **Caminho:** `src/data/mock/process_instances.json`
* **Campos:**
  * `id` (number): Identificador único da instância criada (exibido como `BRA-2026-N`).
  * `process_id` (number): ID do processo disponível associado.
  * `created_by` (number): ID do usuário criador da instância.
  * `createdAt` (string, ISO datetime): Data e hora de criação da instância.

---

## 4. process_instance_roles (Cargos das Instâncias)
* **Caminho:** `src/data/mock/process_instance_roles.json`
* **Campos:**
  * `id` (number): Identificador único do cargo associado.
  * `instance_id` (number): ID da instância do processo relacionada.
  * `user_id` (number): ID do usuário associado.
  * `role` (string): Nome do cargo atribuído ao usuário (ex: "Proponente", "Grupo Gestor", "Laboratórios Participantes").

---

## 5. process_steps (Etapas dos Processos)
* **Caminho:** `src/data/mock/process_steps.json`
* **Campos:**
  * `id` (number): Identificador único da etapa.
  * `process_id` (number): ID do processo disponível associado.
  * `name` (string): Nome da etapa (ex: "SUBMISSÃO E TRIAGEM").
  * `sequence` (number): Ordem sequencial da etapa.
  * `icone` (string): Nome do ícone associado à etapa (ex: "file-text").

---

## 6. process_instance_steps (Instâncias de Etapas de Processos)
* **Caminho:** `src/data/mock/process_instance_steps.json`
* **Campos:**
  * `id` (number): Identificador único da instância da etapa.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `step_id` (number): ID da etapa relacionada.
  * `is_completed` (boolean): Status de conclusão da etapa na instância (true/false).

---

## 7. tasks (Definição de Tarefas)
* **Caminho:** `src/data/mock/tasks.json`
* **Campos:**
  * `id` (number): Identificador único da definição de tarefa.
  * `step_id` (number): ID da etapa associada.
  * `name` (string): Nome descritivo da tarefa.
  * `type` (string): Tipo de tarefa (`form`, `assignment`, `approval`, `sample_definition`, `data_template_definition`).
  * `role` (string): Cargo responsável pela execução.
  * `required_reviewers` (array of strings, opcional): Papéis requeridos para revisar.
  * `target_role` (string, opcional): Cargo alvo a ser definido na tarefa do tipo `assignment`.

---

## 8. process_instance_tasks (Instâncias de Tarefas de Processos)
* **Caminho:** `src/data/mock/process_instance_tasks.json`
* **Campos:**
  * `id` (number): Identificador único da tarefa da instância.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `process_instance_step_id` (number): ID da instância de etapa relacionada.
  * `task_id` (number): ID da definição da tarefa.
  * `is_completed` (boolean): Status de conclusão da tarefa na instância (true/false).
  * `status` (string): Estado do fluxo (`pending`, `pending_submission`, `analyzing_ai`, `pending_review`, `completed`).
  * `current_reviewer_role` (string or null): Papel do revisor atual (se aplicável).
  * `current_review_round_id` (number or null): Rodada de revisão atual.
  * `editable` (boolean): Se o formulário pode ser editado pelo executor.

---

## 9. form_fields (Campos de Formulário Dinâmicos)
* **Caminho:** `src/data/mock/form_fields.json`
* **Campos:**
  * `id` (number): Identificador do campo.
  * `task_id` (number): ID da tarefa associada.
  * `name` (string): Título/Identificador do campo.
  * `type` (string): Tipo de entrada (`text`, `int`, `float`, `upload`).
  * `section` (string): Agrupamento visual das seções.
  * `ai_evaluation` (object, opcional): Configurações de validação de IA (`enabled` e `strategy`).

---

## 10. form_answers (Respostas dos Formulários)
* **Caminho:** `src/data/mock/form_answers.json`
* **Estrutura:** Objeto chaveado pelo ID da instância de tarefa (`process_instance_task_id`), onde cada valor mapeia os IDs de campos às respectivas respostas.

---

## 11. field_reviews (Apontamentos e Revisões de Campos)
* **Caminho:** `src/data/mock/field_reviews.json`
* **Campos:**
  * `id` (number): Identificador único do apontamento.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `review_round_id` (number): Rodada de revisão em que foi gerado.
  * `field_id` (number): ID do campo correspondente.
  * `reviewer_role` (string): Cargo de quem apontou (`ia` ou cargo do revisor).
  * `comment` (string): Texto descritivo da inconsistência ou instrução de correção.
  * `status` (string): Status do apontamento (`active`, `resolved`).

---

## 12. pending_invites (Convites Pendentes por E-mail)
* **Caminho:** `src/data/mock/pending_invites.json`
* **Campos:**
  * `id` (number): Identificador único do convite.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `email` (string): E-mail do convidado.
  * `target_role` (string): Cargo associado ao convite.
  * `status` (string): Status (`sent`, `accepted`).

---

## 13. sample_definitions (Cadastros de Amostras de Substâncias)
* **Caminho:** `src/data/mock/sample_definitions.json`
* **Campos:**
  * `id` (number): Identificador único da amostra.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `chemical_name` (string): Nome químico ou comercial da substância.
  * `casrn` (string): Registro CASRN.
  * `chemical_class` (array of strings): Lista de classes químicas.
  * `product_class` (array of strings): Lista de classes do produto.
  * `appearance` (string): Aparência visual da substância.
  * `physical_state` (string): Estado físico (ex: "Líquido", "Sólido").
  * `quantity` (number): Quantidade enviada.
  * `unit` (string): Unidade de medida (ex: "ml", "g").
  * `ph` (number or null): pH da substância.
  * `kow` (number or null): Coeficiente de partição octanol-água Kow.
  * `volatility` (string): Volatilidade.
  * `reactivity` (string): Descrição de reatividade.
  * `test_concentrations` (array of strings): Concentrações de teste recomendadas.
  * `purity_percentage` (number or null): Grau de pureza percentual.
  * `supplier` (string): Fornecedor da substância.
  * `storage_instructions` (string): Instruções de armazenamento.
  * `handling_instructions` (string): Instruções de manuseio.
  * `disposal_instructions` (string): Instruções de descarte de resíduos.
  * `components` (array of objects): Lista de componentes da mistura (`{ name, concentration }`).
  * `sds_file` (string): Nome do arquivo do SDS.
  * `sds_url` (string): Link do arquivo SDS mockado.

---

## 14. sample_blind_codes (Mapeamento Interno de Códigos Cegos)
* **Caminho:** `src/data/mock/sample_blind_codes.json`
* **Campos:**
  * `id` (number): Identificador único do mapeamento.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `sample_id` (number): ID da amostra relacionada.
  * `laboratory_role_id` (number): ID do cargo no `process_instance_roles` que identifica o laboratório destinatário.
  * `blind_code` (string): Código cego gerado de forma aleatória e única.

---

## 15. data_templates (Templates de Coleta de Dados Estatísticos)
* **Caminho:** `src/data/mock/data_templates.json`
* **Campos:**
  * `id` (number): Identificador único do template.
  * `process_instance_id` (number): ID da instância de processo relacionada.
  * `name` (string): Nome descritivo do template.
  * `description` (string): Finalidade do template.
  * `allow_failed_runs` (boolean): Indica se permite o registro de corridas experimentais sem sucesso.
  * `replicate_configuration` (object): Configuração de réplicas e experimentos (`experiments_per_lab` e `replicates_per_experiment`).

---

## 16. data_template_columns (Definições de Colunas dos Templates)
* **Caminho:** `src/data/mock/data_template_columns.json`
* **Campos:**
  * `id` (number): Identificador único da coluna.
  * `template_id` (number): ID do template associado.
  * `name` (string): Nome técnico/identificador da coluna.
  * `label` (string): Rótulo amigável a ser exibido.
  * `type` (string): Tipo de campo (`text`, `long_text`, `integer`, `decimal`, `boolean`, `date`, `datetime`, `select`, `multiselect`, `file`).
  * `required` (boolean): Flag de obrigatoriedade.
  * `position` (number): Ordem da coluna na tabela.
  * `options` (array of strings): Lista de opções (se o tipo for `select` ou `multiselect`).
  * `is_raw_data` (boolean): Se é dado bruto.
  * `is_derived_data` (boolean): Se é dado derivado/calculado.
  * `source_columns` (array of strings): Lista de nomes de colunas que servem de origem para o dado derivado.
