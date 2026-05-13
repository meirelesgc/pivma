import useMockStore from '../../../store/useMockStore';

const TriagePanel = ({ process }) => {
  const { addContestation } = useMockStore();

  const handleContest = () => {
    const justification = prompt('Insira sua justificativa técnica para contestar a triagem da IA:');
    if (justification) {
      addContestation(process.id, justification);
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

  return (
    <div className="triage-panel-container modern-card">
      <h3 className="section-title">Etapa B — Triagem e Decisão</h3>
      
      <div className="status-block ia-status">
        <div className="status-header">
          <div className="status-source">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
            Análise Automatizada (IA)
          </div>
          <div className="score-badge" style={{ backgroundColor: getIAStatusColor(process.iaStatus) + '22', color: getIAStatusColor(process.iaStatus) }}>
            Score: {process.iaScore}%
          </div>
        </div>
        <div className="status-value" style={{ color: getIAStatusColor(process.iaStatus) }}>
          {process.iaStatus}
        </div>
        <p className="status-description">
          {process.iaStatus === 'Pendência Documental' 
            ? 'A IA identificou inconsistências nos anexos obrigatórios (GD34).' 
            : 'Análise documental preliminar concluída sem bloqueios críticos.'}
        </p>
        
        {process.iaStatus === 'Pendência Documental' && (
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
        </div>
        <div className="status-value">
          {process.bracvamStatus}
        </div>
        <div className="status-meta">
          <span className="label">Autoridade:</span> Equipe BraCVAM (Humano)
        </div>
        <p className="status-description">
          {process.bracvamStatus === 'Aguardando Revisão' 
            ? 'Aguardando validação da equipe técnica após triagem da IA.'
            : 'Decisão final sobre a elegibilidade do método para as fases experimentais.'}
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
