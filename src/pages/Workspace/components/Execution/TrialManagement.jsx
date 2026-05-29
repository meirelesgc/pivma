import { 
  FiUsers, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertCircle,
  FiEye
} from 'react-icons/fi';

const TrialManagement = ({ process }) => {
  const participants = (process.participants || []).filter(p => p.role === 'LABORATORIO_PARTICIPANTE');
  const submissions = process.templateSubmissions || [];

  const getLabProgress = (labEmail) => {
    const labSubmissions = submissions.filter(s => s.labEmail === labEmail);
    const validated = labSubmissions.filter(s => s.status === 'VALIDATED').length;
    // Assuming 3 mandatory sheets for now
    const totalMandatory = 3;
    const percentage = Math.round((validated / totalMandatory) * 100);
    return { percentage, validated, total: totalMandatory };
  };

  return (
    <div className="trial-management">
      <div className="stats-row">
        <div className="stat-card modern-card">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-info">
            <span className="stat-label">Laboratórios Ativos</span>
            <span className="stat-value">{participants.length}</span>
          </div>
        </div>
        <div className="stat-card modern-card">
          <div className="stat-icon"><FiActivity /></div>
          <div className="stat-info">
            <span className="stat-label">Submissões Totais</span>
            <span className="stat-value">{submissions.length}</span>
          </div>
        </div>
        <div className="stat-card modern-card">
          <div className="stat-icon"><FiCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-label">Validados BraCVAM</span>
            <span className="stat-value">{submissions.filter(s => s.status === 'VALIDATED').length}</span>
          </div>
        </div>
      </div>

      <div className="management-grid mt-4">
        <div className="labs-overview modern-card">
          <div className="card-header-flex">
            <h4>Acompanhamento por Laboratório</h4>
            <button className="btn btn-tiny btn-outline-primary">Ver Todos</button>
          </div>
          
          <div className="lab-list-compact mt-3">
            {participants.map(lab => {
              const progress = getLabProgress(lab.email);
              return (
                <div key={lab.email} className="lab-progress-item">
                  <div className="lab-meta">
                    <strong>{lab.name}</strong>
                    <span className="text-smaller text-tertiary">{lab.institution}</span>
                  </div>
                  <div className="lab-progress-bar-container">
                    <div className="progress-text">{progress.percentage}%</div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress.percentage}%` }}></div>
                    </div>
                  </div>
                  <div className="lab-actions">
                    <button className="btn-icon"><FiEye /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="recent-alerts modern-card">
          <h4>Alertas e Desvios</h4>
          <div className="alerts-list mt-3">
            {process.occurrences && process.occurrences.length > 0 ? (
              process.occurrences.map(occ => (
                <div key={occ.id} className="alert-item">
                  <FiAlertCircle className="text-danger" />
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{occ.type}</strong>
                      <span className="alert-time">{new Date(occ.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-smaller m-0">{occ.description}</p>
                    <span className="text-tiny text-tertiary">Relatado por: {occ.reportedBy}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-alerts">
                <FiCheckCircle className="text-success" />
                <span>Nenhum desvio crítico reportado.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .stat-icon { width: 48px; height: 48px; background: rgba(var(--primary-color-rgb), 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--primary-color); }
        .stat-label { display: block; font-size: 12px; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase; }
        .stat-value { display: block; font-size: 24px; font-weight: 700; color: var(--text-primary); }
        
        .management-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .card-header-flex { display: flex; justify-content: space-between; align-items: center; }
        
        .lab-list-compact { display: flex; flex-direction: column; gap: 16px; }
        .lab-progress-item { display: flex; align-items: center; gap: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border-color); }
        .lab-meta { flex: 1; display: flex; flex-direction: column; }
        .lab-progress-bar-container { width: 200px; }
        .progress-text { font-size: 11px; font-weight: 700; text-align: right; margin-bottom: 4px; }
        .progress-bar-bg { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--primary-color); border-radius: 3px; }
        
        .alerts-list { display: flex; flex-direction: column; gap: 12px; }
        .alert-item { display: flex; gap: 12px; padding: 12px; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; }
        .alert-content { flex: 1; }
        .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 13px; }
        .alert-time { font-size: 10px; color: var(--text-tertiary); }
        .empty-alerts { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 150px; color: var(--text-tertiary); gap: 12px; }
      `}</style>
    </div>
  );
};

export default TrialManagement;
