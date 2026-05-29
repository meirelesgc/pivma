import React, { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const MaterialReturn = ({ process }) => {
  const { registerMaterialReturn, user } = useMockStore();
  const [formData, setFormData] = useState({});

  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email);

  const handleStatusChange = (code, status) => {
    setFormData({ ...formData, [code]: status });
  };

  const handleSubmit = () => {
    registerMaterialReturn(process.id, user.email, formData);
    alert('Registro de devolução enviado.');
  };

  return (
    <div className="material-return">
      <div className="return-header">
        <h3>Devolução de Materiais</h3>
        <p className="text-secondary">Informe o status residual das amostras para encerramento logístico.</p>
      </div>

      <div className="return-list">
        {myAssignments.map(ba => (
          <div key={ba.id} className="return-item modern-card">
            <span className="item-code">{ba.blindCode}</span>
            <div className="status-options">
              {[
                { id: 'EMPTY', label: 'Vazio' },
                { id: 'HALF', label: 'Pela Metade' },
                { id: 'FULL', label: 'Não Utilizado' }
              ].map(opt => (
                <div 
                  key={opt.id} 
                  className={`status-option ${formData[ba.blindCode] === opt.id ? 'active' : ''}`}
                  onClick={() => handleStatusChange(ba.blindCode, opt.id)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions-right" style={{ marginTop: '32px' }}>
        <button className="btn btn-primary" onClick={handleSubmit}>Confirmar Devolução</button>
      </div>

      <style>{`
        .material-return { max-width: 600px; margin: 0 auto; }
        .return-list { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .return-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; }
        .item-code { font-weight: 700; }
        .status-options { display: flex; gap: 8px; }
        .status-option {
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          background: #f8fafc;
          font-weight: 600;
        }
        .status-option.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      `}</style>
    </div>
  );
};

export default MaterialReturn;
