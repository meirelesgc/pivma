# Guia de Documentação de Projeto para Crescimento Sustentável — PiVMA

Este documento funciona como o contexto persistente do projeto, o manual operacional da arquitetura, e o guia de decisões técnicas para humanos e ferramentas de inteligência artificial (como Gemini CLI).

---

## 1. Visão Geral do Projeto

O PiVMA é uma plataforma regulatória digital para gerenciamento do fluxo de validação de métodos alternativos ao uso de animais, conduzidos pelo BraCVAM. A plataforma é estruturada em macroetapas auditáveis, suportando a colaboração de múltiplos atores (proponentes, laboratórios, especialistas) com controle granular de permissões e isolamento científico (cegamento).

## 2. Arquitetura Geral

O PiVMA evoluiu de um fluxo linear para um ecossistema multiatores. A arquitetura baseia-se nos seguintes pilares:
*   **Machine-State Driven:** O ciclo de vida do método é estritamente controlado por uma máquina de estados (ex: RASCUNHO, SUBMETIDO, TRIAGEM_IA, PLANEJAMENTO).
*   **Modular por Macroetapa:** A interface e as funcionalidades são divididas por fases lógicas (Submissão, Planejamento, Execução, Revisão).
*   **Permissões Contextuais (Role-Based Access Control):** A autorização é baseada no papel que o usuário desempenha *naquele método específico*, e não apenas em seu perfil global.
*   **UI Reativa ao Estado:** A interface, barras laterais e módulos ativos reagem dinamicamente ao estado atual do processo e ao papel do usuário logado.
*   **Configuração Centralizada:** Regras de transição, estados e permissões são extraídas da UI e centralizadas em arquivos de configuração (ex: `src/config/processStates.js`).

## 3. Fluxo Institucional

O processo de validação é dividido em macroetapas sequenciais:

*   **Macroetapa 1: Submissão e Triagem (Etapas A e B)**
    *   *Estados:* RASCUNHO -> SUBMETIDO -> TRIAGEM_IA -> PENDENTE_AJUSTE / APTO / NAO_ELEGIVEL
    *   *Objetivo:* Recepção do método, análise documental automatizada por IA e revisão humana (Equipe BraCVAM).
*   **Macroetapa 2: Planejamento e Preparação (Etapa C)**
    *   *Estados:* PLANEJAMENTO -> PREPARACAO -> TREINAMENTO
    *   *Objetivo:* Designação do Grupo Gestor, estruturação da rede de laboratórios (Líder e Participantes) e definição/aprovação do protocolo padronizado.
*   **Macroetapa 3: Execução da Validação (Etapas D e E)**
    *   *Estados:* EXECUCAO_METODO -> ANALISE_ESTATISTICA
    *   *Objetivo:* Execução experimental pelos laboratórios participantes e posterior análise estatística (intra e interlaboratorial).
*   **Macroetapa 4: Revisão e Decisão (Etapas F, G, H e I)**
    *   *Estados:* CONSOLIDACAO_DOSSIE -> PEER_REVIEW -> REUNIAO_PARECERES -> APROVADO / REJEITADO
    *   *Objetivo:* Revisão cega por especialistas independentes e decisão institucional final do BraCVAM.

## 4. Sistema de Permissões

O acesso não depende apenas do login, mas da combinação de:
1.  **Perfil Global:** Quem o usuário é institucionalmente (ex: Pesquisador, Admin).
2.  **Papel Contextual no Processo:** A função delegada àquele usuário em um método específico (ex: Coordenador do Grupo Gestor, Laboratório Líder, Laboratório Participante, Estatístico).
3.  **Estado do Método:** Módulos e ações só são liberados em etapas específicas.

*Regra de Ouro:* Nunca hardcodar permissões genéricas. A autorização deve sempre checar se o `user.email` existe na lista de `participants` do processo atual com a `role` adequada para a ação.

## 5. Organização do Código

*   `/src/components`: Componentes reutilizáveis e globais (ex: Header, Sidebar, botões genéricos).
*   `/src/pages`: Vistas principais e roteamento de alto nível (ex: Workspace, Login).
    *   `/src/pages/Workspace/components`: Componentes específicos do ecossistema de validação (ex: MethodForm, TriagePanel).
    *   `/src/pages/Workspace/components/Planning`: Módulos modulares da macroetapa de Planejamento (Governance, Laboratories, Protocol).
*   `/src/store`: Gestão de estado global (atualmente `useMockStore.js` com Zustand).
*   `/src/config`: Configurações centrais, máquinas de estado e matrizes de permissão.
*   `/src/styles`: Estilos globais, baseline visual e temas (`global.css`, `index.css`).

## 6. Regras de UI/UX

*   **Baseline Visual:** O sistema segue um padrão "enterprise" moderno, limpo e técnico.
*   **Consistência:** Utilize as variáveis CSS globais (ex: `--primary-color`, `--text-secondary`) e as classes utilitárias (ex: `.modern-card`, `.btn-primary`, `.btn-tiny`).
*   **Indicadores de Estado:** Use badges para indicar claramente o status do processo e os papéis contextuais.
*   **Layout Modular:** Módulos complexos (como Planejamento) devem ser isolados em cards distintos para evitar poluição visual.

## 7. Convenções Técnicas

*   **Store (Zustand):** Funciona como a fonte única da verdade para dados institucionais e estado dos processos. Evite duplicar estado do processo em componentes locais.
*   **Transições de Estado:** Devem ser feitas exclusivamente através de funções controladas na store (ex: `transitionTo()`), que validam a lógica e inserem automaticamente um log no histórico de auditoria.
*   **Mutações de Domínio:** Ações como `assignParticipant` ou `updateProtocol` também vivem na store para garantir que qualquer mudança estrutural gere um evento de auditoria rastreável.

## 8. Fluxos Operacionais Comuns

*   **Submissão:** Proponente cria rascunho -> anexa documentos -> submete -> IA realiza triagem preliminar -> Equipe BraCVAM valida e aprova (APTO).
*   **Planejamento Institucional:** Após APTO, o processo entra em PLANEJAMENTO -> Admin (BraCVAM) designa o Coordenador do Grupo Gestor -> Coordenador adiciona Laboratórios (Líder e Participantes) -> Lab. Líder rascunha protocolo -> Coordenador aprova protocolo.
*   **Revisão Iterativa:** Durante a submissão, a Equipe BraCVAM pode usar o sistema de comentários por campo para solicitar ajustes -> Proponente altera -> BraCVAM reavalia.

## 9. Padrões Arquiteturais

*   **State Machine Driven UI:** O que o usuário vê e o que ele pode editar é rigidamente amarrado à etapa atual do workflow (`currentState`).
*   **Audit Trail:** Toda alteração de estado, designação de equipe ou mudança de documento anexa obrigatoriamente um evento rastreável no array `history` do processo.
*   **Feature Modularization:** Funcionalidades de domínio rico (ex: elaboração de protocolo) devem ser encapsuladas em seus próprios módulos React.

## 10. Regras do Projeto

1.  *Nunca* hardcodar permissões; use a estrutura `participants` (papéis contextuais).
2.  *Nunca* misturar lógica institucional (mudança de estado complexa) nos componentes de UI; delegue para actions da store ou services isolados.
3.  *Sempre* registre transições importantes no histórico (`addEvent` ou via actions da store).
4.  A barra lateral (`Sidebar`) deve reagir dinamicamente ao estado, mostrando e bloqueando as macroetapas de forma visual e funcional.
5.  Novos módulos devem validar de forma estrita as permissões antes de permitir a exibição de controles de edição (ex: `isEditable = isLeader || isManager`).

## 11. Roadmap Técnico (Status Atual)

### O que já existe:
*   [x] Estrutura base de roteamento e UI.
*   [x] Store Zustand persistente com histórico integrado.
*   [x] Fluxo de Submissão, Sistema de Comentários, Triagem IA e Revisão BraCVAM.
*   [x] Transição para arquitetura multiatores (Papéis Contextuais).
*   [x] **Etapa C (Planejamento):** Módulos funcionais para Grupo Gestor, Laboratórios (Líder/Participantes) e Protocolo Padronizado.
*   [x] Ativação implícita do perfil Equipe BraCVAM via designação no processo.

### O que falta (Próximos Passos):
*   [ ] **Módulo de Gestão de Amostras:** Ambiente restrito e cego para codificação de substâncias.
*   [ ] **Etapa D (Experimental):** Interface para laboratórios participantes realizarem upload padronizado de resultados (protegendo o cegamento).
*   [ ] **Etapa E (Análise Estatística):** Módulo dedicado ao profissional Estatístico.
*   [ ] **Etapa G (Peer Review):** Interface para os Avaliadores Ad Hoc interagirem de forma cega com o dossiê consolidado.
*   [ ] Refatorar a pasta `src/pages/Workspace` separando os componentes em diretórios por domínio dentro de `src/modules/...` conforme o projeto escala.
