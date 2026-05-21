const RegulatoryChecklist = ({ process }) => {
  const demands = [...(process.planningDemands || []), ...(process.executionDemands || [])];
  const gates = demands.filter(d => d.blocksProgression);
  
  if (gates.length === 0) return null;

  const clearedGates = gates.filter(g => g.status === 'CONSOLIDATED');
  const readiness = gates.length > 0 ? Math.round((clearedGates.length / gates.length) * 100) : 0;

  const getStatusIcon = (status) => {
    if (status === 'CONSOLIDATED') return '✓';
    if (status === 'IN_PROGRESS' || status === 'IN_VALIDATION') return '●';
    return '○';
  };

  const getStatusClass = (status) => {
    if (status === 'CONSOLIDATED') return 'gate-consolidated';
    if (status === 'IN_PROGRESS' || status === 'IN_VALIDATION') return 'gate-active';
    return 'gate-pending';
  };

  return (
    <div className="modern-card regulatory-checklist">
      <div className="checklist-header">
        <h4 className="section-title">Checklist de Prontidão</h4>
        <div className="readiness-score">
          <span className="percentage">{readiness}%</span>
          <span className="label">Readiness</span>
        </div>
      </div>

      <div className="readiness-bar-container">
        <div 
          className="readiness-bar-fill" 
          style={{ width: `${readiness}%`, background: readiness === 100 ? '#009c3b' : 'var(--primary-color)' }}
        ></div>
      </div>

      <div className="gates-list">
        {gates.map(gate => (
          <div key={gate.id} className={`gate-item ${getStatusClass(gate.status)}`}>
            <span className="gate-icon">{getStatusIcon(gate.status)}</span>
            <div className="gate-info">
              <span className="gate-title">{gate.title}</span>
              <span className="gate-meta">{gate.targetName}</span>
            </div>
          </div>
        ))}
      </div>

      {readiness < 100 && (
        <div className="readiness-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Avanço de macroetapa bloqueado por pendências críticas.</span>
        </div>
      )}
    </div>
  );
};

export default RegulatoryChecklist;
