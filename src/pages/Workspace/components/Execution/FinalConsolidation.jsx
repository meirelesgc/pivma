import React, { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const FinalConsolidation = ({ process }) => {
  const { updateLabConsolidation, user } = useMockStore();
  const [formData, setFormData] = useState({
    generalFindings: '',
    classifications: {}
  });

  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email);
  const trials = (process.trialRecords || []).filter(t => t.operatorEmail === user.email || true);
  const occurrences = (process.occurrences || []).filter(o => o.labName === user.name);

  const handleClassify = (code, value) => {
    setFormData({
      ...formData,
      classifications: { ...formData.classifications, [code]: value }
    });
  };

  const handleSave = () => {
    updateLabConsolidation(process.id, user.email, formData);
    alert('Consolidação salva! Os dados agora podem ser submetidos ao estatístico.');
  };

  return (
    <div className="final-consolidation">
      <div className="consolidation-header">
        <h3>Consolidação de Resultados</h3>
        <p className="text-secondary">Revise os ensaios realizados e apresente sua classificação final.</p>
      </div>

      <div className="summary-stats-grid">
        <div className="stat-card modern-card">
          <span className="stat-value">{trials.length}</span>
          <span className="stat-label">Ensaios Realizados</span>
        </div>
        <div className="stat-card modern-card">
          <span className="stat-value">{occurrences.length}</span>
          <span className="stat-label">Ocorrências</span>
        </div>
        <div className="stat-card modern-card">
          <span className="stat-value">{(myAssignments.length * 3) - trials.length}</span>
          <span className="stat-label">Replicatas Faltantes</span>
        </div>
      </div>

      <div className="classification-section">
        <h5>Classificação por Amostra Cega</h5>
        <div className="classification-list">
          {myAssignments.map(ba => (
            <div key={ba.id} className="classification-item modern-card">
              <div className="item-info">
                <span className="item-code">{ba.blindCode}</span>
                <span className="item-trials">{trials.filter(t => t.blindCode === ba.blindCode).length} ensaios</span>
              </div>
              <div className="item-actions">
                {['Não Irritante', 'Irritante'].map(cat => (
                  <button 
                    key={cat}
                    className={`btn btn-tiny ${formData.classifications[ba.blindCode] === cat ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleClassify(ba.blindCode, cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '24px' }}>
        <label>Análise Técnica e Observações Finais</label>
        <textarea 
          className="textarea-technical" 
          rows="4" 
          placeholder="Descreva a conclusão técnica do laboratório..."
          value={formData.generalFindings}
          onChange={e => setFormData({...formData, generalFindings: e.target.value})}
        />
      </div>

      <div className="form-actions-right">
        <button className="btn btn-primary" onClick={handleSave}>Salvar Consolidação</button>
      </div>

      <style>{`
        .final-consolidation { max-width: 800px; margin: 0 auto; }
        .summary-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { padding: 16px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: 800; display: block; color: var(--primary-color); }
        .stat-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; }
        
        .classification-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .classification-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; }
        .item-info { display: flex; flex-direction: column; }
        .item-code { font-weight: 700; font-size: 16px; }
        .item-trials { font-size: 11px; color: var(--text-tertiary); }
        .item-actions { display: flex; gap: 8px; }
        
        .btn-outline { border: 1px solid var(--border-color); color: var(--text-secondary); background: transparent; }
        .form-actions-right { display: flex; justify-content: flex-end; margin-top: 32px; }
      `}</style>
    </div>
  );
};

export default FinalConsolidation;
