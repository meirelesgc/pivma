import useMockStore from '../../../store/useMockStore';
import { PROCESS_STATES } from '../../../config/processStates';

const TriagePanel = ({ process }) => {
  const { addContestation, transitionTo, user } = useMockStore();

  const handleContest = () => {
    const justification = prompt('Insira sua justificativa técnica para contestar a triagem da IA:');
    if (justification) {
      addContestation(process.id, justification);
    }
  };

  const handleDecision = (decisionType) => {
    const justification = prompt(`Insira o parecer institucional para a decisão: ${decisionType.toUpperCase()}`);
    if (!justification) return;

    if (decisionType === 'approve') {
      transitionTo(process.id, 'APTO', `Aprovação Institucional: ${justification}`);
      setTimeout(() => transitionTo(process.id, 'PLANEJAMENTO', 'Iniciando fase de Planejamento.'), 1500);
    } else if (decisionType === 'adjust') {
      transitionTo(process.id, 'PENDENTE_AJUSTE', `Ajustes Solicitados: ${justification}`);
    } else if (decisionType === 'reject') {
      transitionTo(process.id, 'NAO_ELEGIVEL', `Submissão Rejeitada: ${justification}`);
    }
  };

  const getIAStatusColor = (status) => {
    switch(status) {
      case 'Apto': return '#009c3b';
      case 'Pendência Documental': return '#ffa500';
      case 'Não Elegível': return '#ff4d4f';
      default: return 'var(--text-tertiary)';
    }
  };

  const currentState = PROCESS_STATES[process.currentState] || PROCESS_STATES.RASCUNHO;
  const isPendingAjuste = process.currentState === 'PENDENTE_AJUSTE';
  const isTriagemIA = process.currentState === 'TRIAGEM_IA';
  const isApto = process.currentState === 'APTO' || currentState.macroStage.order > 1;
  const isRejected = process.currentState === 'NAO_ELEGIVEL';

  // Calculate review summary
  const totalComments = Object.values(process.comments || {}).flat();
  const pendingCommentsCount = totalComments.filter(c => c.status === 'pending').length;

  return (
    <div className="triage-panel-container modern-card">
      <h3 className="section-title">Etapa B — Triagem e Decisão</h3>
      
      <div className={`status-block ia-status ${isTriagemIA ? 'loading-pulse' : ''}`}>
        <div className="status-header">
          <div className="status-source">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
            Análise Automatizada (IA)
          </div>
          {process.iaScore > 0 && (
            <div className="score-badge" style={{ backgroundColor: getIAStatusColor(process.iaStatus) + '22', color: getIAStatusColor(process.iaStatus) }}>
              Score: {process.iaScore}%
            </div>
          )}
        </div>
        <div className="status-value" style={{ color: getIAStatusColor(process.iaStatus) }}>
          {isTriagemIA ? 'Processando...' : process.iaStatus}
        </div>
        <p className="status-description">
          {isTriagemIA && 'A IA está analisando os documentos submetidos e verificando a conformidade com o guia GD34...'}
          {isPendingAjuste && 'A IA identificou inconsistências nos anexos obrigatórios (GD34).'}
          {process.iaStatus === 'Apto' && 'Análise documental preliminar concluída sem bloqueios críticos.'}
        </p>
        
        {isPendingAjuste && user.role === 'Proponente' && (
          <button className="btn btn-secondary btn-tiny" onClick={handleContest} style={{ marginTop: '12px' }}>
            Contestar Análise IA
          </button>
        )}
      </div>

      <div className="status-divider"></div>

      <div className="status-block bracvam-status">
        <div className="status-header">
          <div className="status-source">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
            Decisão Institucional BraCVAM
          </div>
          {pendingCommentsCount > 0 && (
            <div className="score-badge" style={{ backgroundColor: '#ffa50022', color: '#ffa500' }}>
              {pendingCommentsCount} obs. pendentes
            </div>
          )}
        </div>
        <div className="status-value" style={{ color: isRejected ? '#ff4d4f' : 'inherit' }}>
          {isApto ? 'Aprovado para Validação' : isRejected ? 'Não Elegível (Encerrado)' : process.bracvamStatus}
        </div>
        <div className="status-meta">
          <span className="label">Autoridade:</span> Equipe BraCVAM (Humano)
        </div>
        
        {user.role === 'Admin' && !isApto && !isRejected && (
          <div className="decision-actions" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn btn-primary" onClick={() => handleDecision('approve')} style={{ width: '100%' }}>
              Aprovar Método
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => handleDecision('adjust')}>
                Solicitar Ajustes
              </button>
              <button className="btn btn-secondary" onClick={() => handleDecision('reject')} style={{ color: '#ff4d4f' }}>
                Rejeitar
              </button>
            </div>
          </div>
        )}

        <p className="status-description" style={{ marginTop: '12px' }}>
          {isApto 
            ? 'Método elegível. Iniciando designação do Grupo Gestor.' 
            : isRejected 
            ? 'Processo encerrado por não atender aos requisitos institucionais mínimos.'
            : 'Aguardando validação da equipe técnica após triagem da IA.'}
        </p>
      </div>

      <div className="triage-footer">
        <p className="text-tiny text-tertiary">
          * A triagem da IA é consultiva. A aprovação oficial depende exclusivamente da revisão humana do BraCVAM.
        </p>
      </div>
    </div>
  );
};

export default TriagePanel;
