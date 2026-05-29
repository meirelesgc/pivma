import React, { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const IncidentWizard = ({ process, onClose }) => {
  const { registerOccurrence, user } = useMockStore();
  const [formData, setFormData] = useState({
    type: '',
    blindCode: '',
    impact: 'LOW',
    description: '',
    actionTaken: '',
    needsRepeat: 'NO'
  });

  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email);

  const handleSubmit = () => {
    registerOccurrence(process.id, {
      ...formData,
      labName: user.name
    });
    onClose();
    alert('Ocorrência registrada com sucesso.');
  };

  return (
    <div className="incident-wizard">
      <div className="wizard-header">
        <h4>Relatar Ocorrência / Incidente</h4>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="wizard-body">
        <div className="form-group">
          <label>Tipo de Problema</label>
          <div className="incident-type-grid">
            {['Solubilidade', 'Contaminação', 'Quebra de Frasco', 'Falha Equipamento', 'Erro Operacional'].map(type => (
              <div 
                key={type} 
                className={`type-chip ${formData.type === type ? 'active' : ''}`}
                onClick={() => setFormData({...formData, type})}
              >
                {type}
              </div>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Amostra Relacionada</label>
            <select 
              className="input-technical"
              value={formData.blindCode}
              onChange={e => setFormData({...formData, blindCode: e.target.value})}
            >
              <option value="">Selecione...</option>
              {myAssignments.map(ba => <option key={ba.id} value={ba.blindCode}>{ba.blindCode}</option>)}
              <option value="GERAL">Problema Geral / Não Específico</option>
            </select>
          </div>
          <div className="form-group">
            <label>Impacto Estimado</label>
            <select 
              className="input-technical"
              value={formData.impact}
              onChange={e => setFormData({...formData, impact: e.target.value})}
            >
              <option value="LOW">Baixo (Não afeta resultado)</option>
              <option value="MEDIUM">Médio (Pode afetar variabilidade)</option>
              <option value="HIGH">Alto (Invalida ensaio)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Descrição do Ocorrido</label>
          <textarea 
            className="textarea-technical" 
            rows="3"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Ação Tomada</label>
          <input 
            type="text" 
            className="input-technical"
            value={formData.actionTaken}
            onChange={e => setFormData({...formData, actionTaken: e.target.value})}
          />
        </div>
      </div>

      <div className="wizard-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-danger" onClick={handleSubmit} disabled={!formData.type}>Registrar Incidente</button>
      </div>

      <style>{`
        .incident-wizard { padding: 24px; }
        .incident-type-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .type-chip {
          padding: 8px 12px;
          background: #f1f5f9;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .type-chip:hover { background: #e2e8f0; }
        .type-chip.active { background: #fee2e2; border-color: #f87171; color: #991b1b; }
        
        .btn-danger { background: #dc2626; color: white; }
      `}</style>
    </div>
  );
};

export default IncidentWizard;
