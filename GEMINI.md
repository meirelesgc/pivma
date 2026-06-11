# Orientações Gerais

* **Foco em Componentização e Camadas:** Ao implementar novas funcionalidades, concentre-se na criação da lógica de negócios, ganchos (hooks) e serviços necessários. Não crie telas adicionais para demonstração imediata a menos que solicitado. Orientações posteriores instruirão onde e como integrar a nova funcionalidade na interface.
* **Dados Mockados (Prova de Conceito):** Este projeto é um MVP. Todos os dados devem ser mockados inicialmente utilizando arquivos locais estruturados no diretório `src/data/mock`.
* **Persistência Temporária:** Utilize `localStorage` para simular o comportamento de sessões, autenticação e estados que dependem de persistência entre recarregamentos.
* **Composição de Páginas:** Priorize a montagem de páginas através da composição de componentes menores e reutilizáveis, otimizando a manutenção do código e a reutilização de elementos de interface.
* **Significado e Contexto (PI\*VMA):** A sigla PI\*VMA significa Plataforma Inteligente de Validação de Métodos Alternativos. Trata-se de uma plataforma desenvolvida especificamente para o BraCVAM (Centro Brasileiro de Validação de Métodos Alternativos).
* **Guia de estilização:** Prefiro que não utilize emotes, o Ant-Desin possui icones

## Padrões de Design e Estilização

* **Sistema de Cores:** A cor primária da plataforma é o Verde BraCVAM (`rgb(0, 156, 59)`). Utilize as variáveis CSS (`--primary-color`) e o `ConfigProvider` do Ant Design para manter a consistência.
* **Tipografia:**
    *   **Corpo:** Utilize 'Inter', sans-serif para textos informativos e interface.
    *   **Títulos:** Utilize 'Instrument Serif', serif para títulos (H1-H6) para conferir um aspecto institucional e elegante.
* **Componentização com Ant Design:** Priorize o uso de componentes do Ant Design (v5+). Evite criar CSS customizado complexo; prefira utilizar as propriedades dos componentes (como `Flex`, `Space`, `Row/Col`) e tokens de tema.
* **Variáveis CSS:** Sempre que precisar de valores específicos (padding, radius, sombras), utilize as variáveis definidas no `index.css` (ex: `var(--radius-l)`, `var(--shadow-s)`).
* **Animações:** Utilize a classe `.fade-in` para transições suaves de entrada em novas páginas ou seções principais.
* **Tema Único:** O projeto utiliza exclusivamente o **Tema Claro**. Não implemente lógica de tema escuro ou alternadores de tema.