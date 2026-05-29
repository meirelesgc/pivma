import { 
  FiDatabase, 
  FiCheckCircle, 
  FiDownload,
  FiLock
} from 'react-icons/fi';

const FinalConsolidation = ({ process }) => {
  const participants = (process.participants || []).filter(p => p.role === 'LABORATORIO_PARTICIPANTE');
  const submissions = (process.templateSubmissions || []).filter(s => s.status === 'VALIDATED');

  return (
    <div className="final-consolidation">
      <div className="info-banner info mb-4">
        <FiDatabase />
        <div>
          <strong>Consolidação de Dados:</strong> Esta visão agrega todos os dados brutos validados dos laboratórios participantes. 
          Os dados abaixo já passaram pela triagem automática e estão prontos para análise estatística interlaboratorial.
        </div>
      </div>

      <div className="consolidation-grid">
        <div className="dataset-status modern-card">
          <h4>Dataset Interlaboratorial</h4>
          <div className="dataset-meta mt-3">
            <div className="meta-item">
              <span>Amostras Totais:</span>
              <strong>{process.blindAssignments?.length || 0}</strong>
            </div>
            <div className="meta-item">
              <span>Labs com Dados Completos:</span>
              <strong>{participants.filter(p => submissions.some(s => s.labEmail === p.email)).length} / {participants.length}</strong>
            </div>
            <div className="meta-item">
              <span>Registros Consolidados:</span>
              <strong>{submissions.length} templates validados</strong>
            </div>
          </div>
          
          <button className="btn btn-primary btn-block mt-4">
            <FiDownload /> Exportar Dataset Completo (XLSX)
          </button>
          <button className="btn btn-outline-primary btn-block">
            <FiLock /> Bloquear Dataset para Estatística
          </button>
        </div>

        <div className="lab-data-matrix modern-card">
          <h4>Matriz de Consistência</h4>
          <div className="matrix-table-container mt-3">
            <table className="modern-table technical">
              <thead>
                <tr>
                  <th>Laboratório</th>
                  <th>Recebimento</th>
                  <th>Dados Brutos</th>
                  <th>Soluções</th>
                  <th>Status Final</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(lab => {
                  const labSubs = submissions.filter(s => s.labEmail === lab.email);
                  return (
                    <tr key={lab.email}>
                      <td><div className="lab-name-cell"><strong>{lab.name}</strong><span>{lab.institution}</span></div></td>
                      <td>{labSubs.some(s => s.sheetId === 's3') ? <FiCheckCircle className="text-success" /> : <div className="dot" />}</td>
                      <td>{labSubs.some(s => s.sheetId === 's1') ? <FiCheckCircle className="text-success" /> : <div className="dot" />}</td>
                      <td>{labSubs.some(s => s.sheetId === 's2') ? <FiCheckCircle className="text-success" /> : <div className="dot" />}</td>
                      <td>
                        <span className={`badge ${labSubs.length >= 3 ? 'badge-success' : 'badge-neutral'}`}>
                          {labSubs.length >= 3 ? 'COMPLETO' : 'PENDENTE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="preliminary-charts modern-card mt-4">
        <div className="chart-header">
          <h4>Análise Preliminar de Reprodutibilidade</h4>
          <span className="text-tiny">Média OD570 por Laboratório (Exemplo)</span>
        </div>
        <div className="mock-chart-container">
          <div className="chart-bars">
            {participants.map((lab, i) => (
              <div key={lab.email} className="chart-bar-group">
                <div className="bar" style={{ height: `${60 + (i * 10)}%` }}>
                  <span className="bar-value">{(0.7 + (i * 0.05)).toFixed(3)}</span>
                </div>
                <span className="bar-label">{lab.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .consolidation-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
        .meta-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); font-size: 14px; }
        
        .lab-name-cell { display: flex; flex-direction: column; }
        .lab-name-cell span { font-size: 10px; color: var(--text-tertiary); }
        .technical td { vertical-align: middle; text-align: center; }
        .technical td:first-child { text-align: left; }
        .dot { width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%; margin: 0 auto; }
        
        .mock-chart-container { height: 200px; margin-top: 24px; display: flex; align-items: flex-end; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .chart-bars { display: flex; align-items: flex-end; justify-content: space-around; width: 100%; height: 100%; }
        .chart-bar-group { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
        .bar { width: 40px; background: var(--primary-color); border-radius: 4px 4px 0 0; position: relative; transition: height 0.3s ease; }
        .bar-value { position: absolute; top: -20px; font-size: 10px; font-weight: 700; width: 100%; text-align: center; }
        .bar-label { font-size: 10px; font-weight: 600; color: var(--text-tertiary); }
        
        .info-banner.info { background: #e6f7ff; border: 1px solid #91d5ff; color: #0050b3; }
      `}</style>
    </div>
  );
};

export default FinalConsolidation;
