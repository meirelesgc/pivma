import React, { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';
import TrialForm from './TrialForm';

const TrialManagement = ({ process }) => {
  const { user } = useMockStore();
  const [showForm, setShowForm] = useState(false);

  const trials = (process.trialRecords || []).filter(t => t.operatorEmail === user.email || true); // Simplification for mock

  return (
    <div className="trial-management">
      <div className="section-header-actions">
        <div>
          <h3>Registro de Ensaios</h3>
          <p className="text-secondary">Gerencie as rotinas de bancada e registros experimentais.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Novo Ensaio</button>
      </div>

      <div className="trial-list">
        {trials.length === 0 ? (
          <div className="empty-state modern-card">
            <p>Nenhum ensaio registrado para este estudo.</p>
            <button className="action-link" onClick={() => setShowForm(true)}>Iniciar primeiro ensaio</button>
          </div>
        ) : (
          trials.map(trial => (
            <div key={trial.id} className="trial-item-card modern-card">
              <div className="trial-main-info">
                <div className="trial-badge">#{trial.id.slice(-4).toUpperCase()}</div>
                <div className="trial-details">
                  <div className="trial-title">Ensaio de {trial.method || 'Viabilidade'}</div>
                  <div className="trial-meta">
                    <span>Amostra: <strong>{trial.blindCode}</strong></span>
                    <span>•</span>
                    <span>Data: {new Date(trial.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="trial-status">
                <span className="badge-status success">FINALIZADO</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <TrialForm 
              process={process} 
              onClose={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}

      <style>{`
        .trial-management { max-width: 900px; margin: 0 auto; }
        .section-header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .trial-list { display: flex; flex-direction: column; gap: 12px; }
        .trial-item-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-left: 4px solid #009c3b;
        }
        .trial-main-info { display: flex; align-items: center; gap: 16px; }
        .trial-badge {
          background: var(--bg-secondary);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 700;
          font-size: 12px;
        }
        .trial-title { font-weight: 600; color: var(--text-primary); }
        .trial-meta { font-size: 12px; color: var(--text-tertiary); display: flex; gap: 8px; margin-top: 2px; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
        .modal-content-large { background: white; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; border-radius: 12px; }
      `}</style>
    </div>
  );
};

export default TrialManagement;
