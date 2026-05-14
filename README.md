# PiVMA - Plataforma de Validação de Métodos Alternativos

O PiVMA é uma plataforma digital desenvolvida para gerenciar e operacionalizar o fluxo regulatório e científico de validação de métodos alternativos ao uso de animais, em conformidade com as diretrizes do BraCVAM (Centro Brasileiro para Validação de Métodos Alternativos).

## 🚀 Visão Geral

A plataforma evoluiu de um fluxo linear de submissão para um ecossistema multiatores, permitindo a colaboração coordenada entre proponentes, equipe técnica do BraCVAM, grupos gestores, laboratórios e especialistas independentes.

## 🛠️ Tecnologias Principais

- **React 19** (Vite)
- **Zustand** (Gestão de Estado com Persistência)
- **React Router 7** (Navegação Contextual)
- **Vanilla CSS** (Interface Enterprise e Sofisticada)
- **ESLint** (Qualidade de Código)

## 🏗️ Arquitetura do Sistema

O PiVMA baseia-se em três pilares fundamentais:

1.  **Máquina de Estados:** Controle rigoroso do ciclo de vida do método, desde o rascunho até a decisão final.
2.  **Papéis Contextuais:** Gestão de responsabilidades específica por processo (ex: um usuário pode ser Estatístico no Método A e Coordenador no Método B).
3.  **Módulos Funcionais:** Separação de interface por macroetapa (Submissão, Planejamento, Execução e Revisão).

## 📋 Funcionalidades Implementadas

### **Macroetapa 1: Submissão e Triagem**
- [x] **Formulário de Submissão:** Cadastro técnico detalhado do método.
- [x] **Triagem IA:** Análise automatizada documental e geração de score de prontidão.
- [x] **Revisão Institucional:** Interface para a equipe BraCVAM validar a triagem e emitir decisões.
- [x] **Sistema de Comentários:** Revisão granular por campo com marcação de pendências.

### **Macroetapa 2: Planejamento e Preparação (Etapa C)**
- [x] **Governança e Patrocinador:** Designação do Grupo Gestor e cadastro de entidades financiadoras.
- [x] **Rede Experimental:** Gestão de Laboratórios Líderes e Participantes.
- [x] **Protocolo Padronizado:** Ambiente técnico para definição metodológica com controle de versão.

### **Histórico e Auditoria**
- [x] **Timeline de Eventos:** Registro detalhado de todas as transições, atribuições e edições, garantindo rastreabilidade total.

## 🛤️ Roadmap (Em Desenvolvimento)

- [ ] **Módulo de Amostras:** Gestão de codificação cega e distribuição de substâncias.
- [ ] **Execução Experimental:** Upload padronizado de resultados laboratoriais.
- [ ] **Módulo Estatístico:** Cálculo automático de variações intra e interlaboratoriais.
- [ ] **Peer Review:** Interface de avaliação cega para especialistas ad hoc.

## 📦 Como Iniciar

1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Inicie o ambiente de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  Execute o linting para garantir a qualidade:
    ```bash
    npm run lint
    ```

## 📄 Licença

Este projeto é de propriedade institucional do BraCVAM. Todos os direitos reservados.
