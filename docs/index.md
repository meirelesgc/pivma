# Plataforma de Validação de Métodos para o BraCVAM (PI*VMA)

Bem-vindo à documentação oficial da **PI\*VMA (Plataforma de Validação de Métodos para o BraCVAM)**.

Este projeto tem como objetivo gerenciar e orquestrar o fluxo de submissão, planejamento, execução e revisão de métodos alternativos de validação científica para o **BraCVAM** (Centro Brasileiro para Validação de Métodos Alternativos).

---

## Estrutura da Documentação

Esta documentação está dividida nas seguintes seções principais:

1. **[Estrutura do Projeto e Modelo de Domínio](estrutura.md)**
    - Apresentação da arquitetura conceitual e de execução do sistema.
    - Relação e hierarquia de entidades: **Processo - Etapa - Tarefa**.
    - Modelagem de configurações e instâncias.
    - Controle de acesso, papéis e orquestração de fluxo por serviços.

2. **[Catálogo de Tarefas e Implementações](tarefas.md)**
    - Listagem detalhada das 50 tarefas atualmente disponíveis no sistema.
    - Explicação dos tipos de tarefas e seus respectivos componentes visuais em React.
    - Como as tarefas podem ser anexadas a uma ou mais etapas de validação.

---

## Visão Geral da Arquitetura

A plataforma PI\*VMA é estruturada com base em um motor de fluxo de trabalho (workflow) flexível e dinâmico, onde todo o comportamento do sistema é guiado por configurações em arquivos JSON locais (dados mockados em [src/data/mock](file:///home/meirelesgc/Projects/BraCVAM/pivma/src/data/mock)). Isso permite modificar o fluxo e as etapas de validação sem a necessidade de reescrever lógica do front-end.

Para entender detalhadamente como o fluxo de dados e os papéis dos participantes interagem, siga para a página de **[Estrutura do Projeto](estrutura.md)**.
