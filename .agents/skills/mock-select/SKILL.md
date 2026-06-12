---
name: mock-select
description: Consulta e extração de dados específicos em arquivos JSON locais (dados mockados) usando a ferramenta jq e a função select. Ativar ao precisar consultar bancos de dados mockados localmente.
---

# Consulta de Dados Locais com JQ

Esta Skill descreve como realizar consultas e extrair fatias específicas de dados armazenados em arquivos JSON (como bancos de dados mockados) utilizando a ferramenta de linha de comando `jq`.

## Funcionamento

O `jq` atua como um processador de texto voltado para o formato JSON. Ele permite varrer arrays, filtrar chaves específicas e retornar os dados formatados diretamente no terminal ou exportá-los para novos arquivos.

## Exemplo Prático

Para filtrar registros com base em um critério específico, utiliza-se a função `select`. O comando abaixo exemplifica a extração de itens onde o campo `stage_id` é igual a `2`:

```bash
jq '[.[] | select(.stage_id == 2)]' src/data/mock/process_tasks.json