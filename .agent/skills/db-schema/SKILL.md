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
  * `system_role` (string): Função do usuário no sistema.

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
  * `role` (string): Nome do cargo atribuído ao usuário (ex: "Proponente").

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

