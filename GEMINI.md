# Orientações Gerais

* **Foco em Componentização e Camadas:** Ao implementar novas funcionalidades, concentre-se na criação da lógica de negócios, ganchos (hooks) e serviços necessários. Não crie telas adicionais para demonstração imediata a menos que solicitado. Orientações posteriores instruirão onde e como integrar a nova funcionalidade na interface.
* **Dados Mockados (Prova de Conceito):** Este projeto é um MVP. Todos os dados devem ser mockados inicialmente utilizando arquivos locais estruturados no diretório `src/data/mock`.
* **Persistência Temporária:** Utilize `localStorage` para simular o comportamento de sessões, autenticação e estados que dependem de persistência entre recarregamentos.
* **Composição de Páginas:** Priorize a montagem de páginas através da composição de componentes menores e reutilizáveis, otimizando a manutenção do código e a reutilização de elementos de interface.
* **Significado e Contexto (PI\*VMA):** A sigla PI\*VMA significa Plataforma Inteligente de Validação de Métodos Alternativos. Trata-se de uma plataforma desenvolvida especificamente para o BraCVAM (Centro Brasileiro de Validação de Métodos Alternativos).