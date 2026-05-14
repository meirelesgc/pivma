export const MACRO_STAGES = {
  SUBMISSION_TRIAGE: {
    id: 'SUBMISSION_TRIAGE',
    label: 'SUBMISSÃO E TRIAGEM',
    order: 1
  },
  PLANNING_PREPARATION: {
    id: 'PLANNING_PREPARATION',
    label: 'PLANEJAMENTO E PREPARAÇÃO',
    order: 2
  },
  EXPERIMENTAL_EXECUTION: {
    id: 'EXPERIMENTAL_EXECUTION',
    label: 'EXECUÇÃO DA VALIDAÇÃO',
    order: 3
  },
  REVIEW_DECISION: {
    id: 'REVIEW_DECISION',
    label: 'REVISÃO E DECISÃO',
    order: 4
  }
};

export const PROCESS_STATES = {
  // SUBMISSION_TRIAGE
  RASCUNHO: {
    id: 'RASCUNHO',
    label: 'Rascunho',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: ['SUBMETIDO'],
    roles: ['Proponente']
  },
  SUBMETIDO: {
    id: 'SUBMETIDO',
    label: 'Submetido',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: ['TRIAGEM_IA'],
    roles: ['Proponente', 'Equipe BraCVAM']
  },
  TRIAGEM_IA: {
    id: 'TRIAGEM_IA',
    label: 'Triagem IA',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: ['PENDENTE_AJUSTE', 'NAO_ELEGIVEL', 'APTO'],
    roles: ['system']
  },
  PENDENTE_AJUSTE: {
    id: 'PENDENTE_AJUSTE',
    label: 'Necessita Ajuste',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: ['SUBMETIDO', 'CONTESTADO'],
    roles: ['Proponente']
  },
  CONTESTADO: {
    id: 'CONTESTADO',
    label: 'Contestado',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: ['APTO', 'NAO_ELEGIVEL', 'PENDENTE_AJUSTE'],
    roles: ['Proponente', 'Equipe BraCVAM']
  },
  NAO_ELEGIVEL: {
    id: 'NAO_ELEGIVEL',
    label: 'Não Elegível',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: [],
    roles: ['Equipe BraCVAM']
  },
  APTO: {
    id: 'APTO',
    label: 'Apto',
    macroStage: MACRO_STAGES.SUBMISSION_TRIAGE,
    transitions: ['PLANEJAMENTO'],
    roles: ['Equipe BraCVAM']
  },

  // PLANNING_PREPARATION
  PLANEJAMENTO: {
    id: 'PLANEJAMENTO',
    label: 'Planejamento',
    macroStage: MACRO_STAGES.PLANNING_PREPARATION,
    transitions: ['PREPARACAO'],
    roles: ['Grupo Gestor', 'Equipe BraCVAM']
  },
  PREPARACAO: {
    id: 'PREPARACAO',
    label: 'Preparação',
    macroStage: MACRO_STAGES.PLANNING_PREPARATION,
    transitions: ['TREINAMENTO', 'PLANEJAMENTO'],
    roles: ['Grupo Gestor', 'Laboratório Líder']
  },
  TREINAMENTO: {
    id: 'TREINAMENTO',
    label: 'Treinamento',
    macroStage: MACRO_STAGES.PLANNING_PREPARATION,
    transitions: ['EXECUCAO_METODO', 'PREPARACAO'],
    roles: ['Laboratório Líder', 'Laboratórios Participantes']
  },

  // EXPERIMENTAL_EXECUTION
  EXECUCAO_METODO: {
    id: 'EXECUCAO_METODO',
    label: 'Execução do Método',
    macroStage: MACRO_STAGES.EXPERIMENTAL_EXECUTION,
    transitions: ['ANALISE_ESTATISTICA'],
    roles: ['Laboratórios Participantes']
  },
  ANALISE_ESTATISTICA: {
    id: 'ANALISE_ESTATISTICA',
    label: 'Análise Estatística',
    macroStage: MACRO_STAGES.EXPERIMENTAL_EXECUTION,
    transitions: ['CONSOLIDACAO_DOSSIE', 'EXECUCAO_METODO'],
    roles: ['Estatístico']
  },

  // REVIEW_DECISION
  CONSOLIDACAO_DOSSIE: {
    id: 'CONSOLIDACAO_DOSSIE',
    label: 'Consolidação do Dossiê',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: ['PEER_REVIEW'],
    roles: ['Grupo Gestor']
  },
  PEER_REVIEW: {
    id: 'PEER_REVIEW',
    label: 'Peer Review',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: ['REUNIAO_PARECERES'],
    roles: ['Avaliadores Ad hoc']
  },
  REUNIAO_PARECERES: {
    id: 'REUNIAO_PARECERES',
    label: 'Reunião de Pareceres',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: ['APROVADO', 'APROVADO_RESTRICOES', 'REJEITADO', 'NOVA_RODADA_DADOS'],
    roles: ['Grupo Gestor', 'Equipe BraCVAM']
  },
  NOVA_RODADA_DADOS: {
    id: 'NOVA_RODADA_DADOS',
    label: 'Nova Rodada de Dados',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: ['EXECUCAO_METODO'],
    roles: ['Grupo Gestor']
  },
  APROVADO: {
    id: 'APROVADO',
    label: 'Aprovado',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: [],
    roles: ['Equipe BraCVAM']
  },
  APROVADO_RESTRICOES: {
    id: 'APROVADO_RESTRICOES',
    label: 'Aprovado com Restrições',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: [],
    roles: ['Equipe BraCVAM']
  },
  REJEITADO: {
    id: 'REJEITADO',
    label: 'Rejeitado',
    macroStage: MACRO_STAGES.REVIEW_DECISION,
    transitions: [],
    roles: ['Equipe BraCVAM']
  }
};

export const getMacroStageProgress = (currentStateId) => {
  const state = PROCESS_STATES[currentStateId];
  if (!state) return 0;
  return state.macroStage.order;
};

export const isStageUnlocked = (currentStateId, stageId) => {
  const currentProgress = getMacroStageProgress(currentStateId);
  const stage = MACRO_STAGES[stageId];
  return currentProgress >= stage.order;
};
