# Resumo Geral da Aplicação

A aplicação é uma plataforma de gestão de validação de métodos alternativos, organizada em torno de processos regulatórios colaborativos e auditáveis. O sistema funciona como um ambiente centralizado para:

* submissão de propostas;
* triagem técnica inicial;
* planejamento do estudo de validação;
* coordenação entre laboratórios;
* execução experimental;
* análise estatística;
* revisão independente;
* consolidação de pareceres;
* decisão final institucional.

A plataforma é baseada em:

* workflow orientado por etapas;
* delegação de tarefas;
* múltiplos papéis dinâmicos;
* controle de permissões;
* rastreabilidade;
* auditoria;
* colaboração entre instituições.

O frontend atual foi estruturado para permitir:

* prototipação rápida;
* escalabilidade;
* modularização;
* evolução futura para backend/API.

---

# Conceito Central do Sistema

O sistema não gira em torno de “formulários isolados”.

O núcleo da aplicação é:

```txt id="y4ldc9"
PROCESSO
 ├── Etapas
 ├── Usuários
 ├── Papéis
 ├── Tarefas
 ├── Documentos
 ├── Pareceres
 ├── Eventos
 ├── Auditoria
 └── Decisões
```

Cada processo possui:

* um estado atual;
* responsáveis ativos;
* tarefas pendentes;
* documentos associados;
* prazos;
* histórico completo.

---

# Macrofluxo da Plataforma

## 1. Intake / Submissão

Entrada formal do método no sistema.

Inclui:

* cadastro da proposta;
* formulário inicial;
* upload de documentos;
* análise automática;
* triagem inicial.

---

## 2. Planejamento Técnico

Organização do estudo de validação.

Inclui:

* definição do Grupo Gestor;
* escolha do Laboratório Líder;
* seleção dos laboratórios;
* definição de substâncias;
* desenho experimental;
* cronograma;
* protocolo.

---

## 3. Execução Experimental

Fase operacional e laboratorial.

Inclui:

* distribuição cega de amostras;
* execução experimental;
* upload padronizado de resultados;
* monitoramento;
* consolidação dos dados.

---

## 4. Revisão e Deliberação

Fase regulatória e decisória.

Inclui:

* análise estatística;
* geração do dossiê;
* peer review;
* pareceres;
* discussão técnica;
* decisão institucional final.

---

# Estrutura Funcional da Aplicação

## Dashboard

Visão geral:

* processos ativos;
* pendências;
* tarefas;
* prazos;
* indicadores;
* status globais.

---

## Gestão de Processos

Lista geral de processos:

* filtragem;
* busca;
* status;
* prioridade;
* responsáveis;
* etapa atual.

---

## Página de Processo

Página central da aplicação.

Provavelmente será o núcleo do sistema.

Deve conter:

* timeline;
* workflow;
* tarefas;
* documentos;
* comentários;
* participantes;
* pareceres;
* auditoria.

---

## Workflow

Representação visual do fluxo:

* estados;
* dependências;
* aprovações;
* bloqueios;
* transições.

---

## Gestão de Tarefas

Sistema interno de delegação:

* responsável;
* prazo;
* prioridade;
* anexos;
* checklist;
* comentários;
* histórico.

---

## Gestão Documental

Controle de:

* uploads;
* versões;
* modelos;
* pareceres;
* protocolos;
* relatórios.

---

## Revisão e Pareceres

Módulo isolado para:

* revisão cega;
* emissão de parecer;
* aprovação/rejeição;
* solicitação de ajustes.

---

# Estrutura de Permissões

O sistema possui dois níveis principais de identidade:

## 1. Perfil institucional/base

Define:

* quem o usuário é;
* vínculo institucional;
* acesso inicial.

Exemplo:

* Proponente
* BraCVAM

---

## 2. Papéis atribuídos ao processo

Definem:

* o que o usuário pode fazer naquele processo específico.

Um mesmo usuário pode:

* iniciar como Proponente;
* virar Laboratório Líder;
* participar do Grupo Gestor;
* atuar como observador em outro processo.

Ou seja:

* permissões são contextuais ao processo.

---

# Funcionamento por Perfil

# Proponente

Responsável pela submissão inicial do método.

## Pode:

* criar processos;
* preencher formulários;
* enviar documentos;
* acompanhar status;
* responder pendências;
* indicar laboratório líder;
* sugerir participantes;
* acompanhar deliberações.

## Não pode:

* aprovar validações;
* alterar pareceres;
* acessar revisão cega.

---

# Equipe BraCVAM

Administrador institucional do fluxo.

## Pode:

* validar submissões;
* aprovar triagem;
* abrir etapas;
* encerrar processos;
* atribuir permissões;
* convidar revisores;
* emitir decisão final;
* acompanhar auditoria;
* supervisionar workflow.

## É o perfil com maior autoridade institucional.

---

# Grupo Gestor

Comitê operacional/técnico do estudo.

## Pode:

* elaborar plano do estudo;
* definir cronograma;
* criar tarefas;
* definir protocolos;
* aprovar andamento;
* monitorar laboratórios;
* consolidar resultados;
* discutir pareceres.

## Atua como centro de coordenação técnica.

---

# Coordenador do Grupo Gestor

Usuário com permissões ampliadas dentro do Grupo Gestor.

## Pode:

* cadastrar laboratórios;
* distribuir tarefas;
* atualizar cronogramas;
* organizar reuniões;
* liberar próximas etapas;
* consolidar entregas.

## Funciona como gestor operacional diário.

---

# Laboratório Líder

Responsável técnico principal do método.

## Pode:

* cadastrar protocolo oficial;
* disponibilizar materiais;
* treinar laboratórios;
* responder dúvidas técnicas;
* revisar execução experimental;
* validar conformidade técnica.

## Atua como referência metodológica.

---

# Laboratórios Participantes

Executores do estudo experimental.

## Pode:

* acessar tarefas experimentais;
* receber amostras;
* registrar resultados;
* enviar planilhas;
* anexar evidências;
* responder inconsistências.

## Não acessa:

* identificação real das substâncias;
* pareceres cegos;
* decisões internas.

---

# Grupo de Seleção de Amostras

Módulo isolado e altamente restrito.

## Pode:

* cadastrar substâncias;
* codificar amostras;
* controlar randomização;
* registrar distribuição;
* manter sigilo experimental.

## Deve operar separado do restante do fluxo.

Provavelmente exigirá:

* permissões especiais;
* logs reforçados;
* telas próprias.

---

# Estatístico

Responsável pela análise quantitativa.

## Pode:

* acessar dados consolidados;
* importar resultados;
* gerar análises;
* emitir relatório estatístico;
* validar consistência;
* anexar parecer técnico.

## Deve operar em módulo específico.

---

# Avaliadores / Especialistas

Revisão independente.

## Pode:

* acessar dossiê;
* emitir parecer;
* aprovar/rejeitar;
* solicitar ajustes;
* comentar tecnicamente.

## Deve atuar em ambiente cego:

* sem influência externa;
* sem acesso indevido às identidades.

---

# Patrocinador

Participação institucional/financeira.

## Pode:

* acompanhar andamento;
* visualizar cronograma;
* acessar relatórios autorizados;
* participar de reuniões.

## Normalmente com acesso limitado.

---

# Observadores / Colaboradores

Perfil de acompanhamento.

## Pode:

* visualizar etapas autorizadas;
* acompanhar documentos liberados;
* participar de reuniões específicas.

## Sem poder decisório.

---

# Aspectos Arquiteturais Importantes

## O sistema é orientado a eventos

Exemplo:

```txt id="52q5d5"
Triagem aprovada
→ cria tarefa automaticamente
→ define prazo
→ notifica responsáveis
→ libera módulo seguinte
```

---

## O sistema é altamente auditável

Tudo deve gerar histórico:

* mudança de status;
* upload;
* comentário;
* parecer;
* alteração de prazo;
* troca de responsável.

---

## O sistema é modular

Cada etapa possui:

* componentes próprios;
* permissões próprias;
* estados próprios.

---

# Componentes Mais Estratégicos do Frontend

## WorkflowTimeline

Visualização macro do processo.

---

## WorkflowKanban

Controle operacional de tarefas.

---

## TaskDrawer

Centro operacional da tarefa:

* anexos;
* comentários;
* prazos;
* responsáveis.

---

## DocumentUploader

Elemento central da plataforma.

---

## DecisionPanel

Tela crítica para deliberações.

---

## ProcessDetails

Provavelmente será a principal tela do sistema inteiro.

Ela deve futuramente concentrar:

* tabs;
* workflow;
* timeline;
* documentos;
* tarefas;
* auditoria;
* participantes;
* pareceres;
* deliberação.
