# PI*VMA Domínio
Regras de negócio e hierarquia de entidades.

## Ativação
* Implementação de lógicas de fluxo de trabalho ou modelagem de dados.

## Regras de Comportamento
* Definição da sigla PI*VMA: Plataforma de Validação de Métodos para o BraCVAM.
* Estruture a configuração em: Processo (`process_types`), Etapa (`process_stages`) e Tarefa (`process_tasks`).
* Instancie execuções através de `ProcessInstance`, `StageInstance` e `TaskInstance`.
* Controle acesso e papéis via `process_participants`.
* Isole a orquestração de fluxo em serviços (`processService`, `taskService`).
* Adicione métodos de validação através da configuração de formulários e tipos nos arquivos de mock.