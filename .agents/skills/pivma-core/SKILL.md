---
name: pivma-core
description: Restrições de arquitetura, hooks, serviços e diretrizes gerais para o MVP do projeto PI*VMA. Sempre ativa para o projeto PI*VMA.
---

# PI*VMA Core
Restrições de arquitetura e desenvolvimento do MVP.

## Ativação
* Sempre ativa para o projeto PI*VMA.

## Regras de Comportamento
* Concentre a implementação em lógica de negócios, hooks e serviços.
* Crie telas apenas mediante solicitação.
* Utilize dados mockados em `src/data/mock`.
* Utilize `localStorage` para persistência de sessões, autenticação e estados.
* Monte páginas através da composição de componentes de UI.