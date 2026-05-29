import React, { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const TrialForm = ({ process, onClose }) => {
  const { addTrialRecord, user } = useMockStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    blindCode: '',
    operator: user?.name,
    equipment: '',
    consumption: '',
    cellLote: '',
    results: [
      { id: 1, replicata: 'R1', value: '' },
      { id: 2, replicata: 'R2', value: '' },
      { id: 3, replicata: 'R3', value: '' }
    ]
  });

  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email && ba.status === 'RECEIVED');

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    addTrialRecord(process.id, {
      ...formData,
      status: 'FINALIZADO'
    });
    onClose();
  };

  return (
    <div className="trial-wizard">
      <div className="wizard-header">
        <div className="wizard-title">
          <h4>Novo Registro de Ensaio</h4>
          <span className="step-indicator">Etapa {step} de 3</span>
        </div>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="wizard-body">
        {step === 1 && (
          <div className="wizard-step">
            <h5>Contexto Operacional</h5>
            <div className="form-group">
              <label>Amostra Cega</label>
              <select 
                value={formData.blindCode} 
                onChange={e => setFormData({...formData, blindCode: e.target.value})}
                className="input-technical"
              >
                <option value="">Selecione a amostra...</option>
                {myAssignments.map(ba => <option key={ba.id} value={ba.blindCode}>{ba.blindCode}</option>)}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Equipamento</label>
                <input 
                  type="text" 
                  className="input-technical" 
                  placeholder="Ex: Leitor de Placas BioTek"
                  value={formData.equipment}
                  onChange={e => setFormData({...formData, equipment: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Lote Celular</label>
                <input 
                  type="text" 
                  className="input-technical" 
                  placeholder="Ex: HCE-2026-05"
                  value={formData.cellLote}
                  onChange={e => setFormData({...formData, cellLote: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h5>Consumo da Amostra</h5>
            <div className="inventory-card modern-card">
              <div className="inventory-info">
                <span className="inventory-label">Estoque Atual:</span>
                <span className="inventory-value">20.0 mL</span>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Quantidade Utilizada (mL)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-technical input-large" 
                  placeholder="0.0"
                  value={formData.consumption}
                  onChange={e => setFormData({...formData, consumption: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h5>Dados Brutos (Leitura)</h5>
            <p className="text-smaller text-secondary mb-4">Insira os valores de absorbância/viabilidade conforme protocolo.</p>
            
            <div className="replicas-container">
              {formData.results.map((res, index) => (
                <div key={res.id} className="replica-input-row">
                  <div className="replica-label">{res.replicata}</div>
                  <input 
                    type="number" 
                    className="input-technical" 
                    placeholder="Valor"
                    value={res.value}
                    onChange={e => {
                      const newResults = [...formData.results];
                      newResults[index].value = e.target.value;
                      setFormData({...formData, results: newResults});
                    }}
                  />
                  <span className="unit-label">OD</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="wizard-footer">
        {step > 1 && <button className="btn btn-secondary" onClick={handleBack}>Voltar</button>}
        <div style={{ flex: 1 }} />
        {step < 3 ? (
          <button className="btn btn-primary" onClick={handleNext} disabled={step === 1 && !formData.blindCode}>Continuar</button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit}>Finalizar Ensaio</button>
        )}
      </div>

      <style>{`
        .trial-wizard { padding: 24px; }
        .wizard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .wizard-title h4 { margin: 0; }
        .step-indicator { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; }
        .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-tertiary); }
        
        .wizard-body { min-height: 250px; }
        .wizard-step h5 { margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .input-large { font-size: 24px; font-weight: 700; text-align: center; }
        
        .inventory-card { background: #f8fafc; padding: 20px; border: 1px solid var(--border-color); }
        .inventory-info { display: flex; justify-content: space-between; font-size: 14px; }
        .inventory-value { font-weight: 700; color: var(--primary-color); }
        
        .replicas-container { display: flex; flex-direction: column; gap: 12px; }
        .replica-input-row { display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 12px; border-radius: 8px; }
        .replica-label { font-weight: 700; width: 30px; }
        .unit-label { font-size: 12px; font-weight: 600; color: var(--text-tertiary); }
        
        .wizard-footer { display: flex; gap: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border-color); }
        .btn-success { background: #009c3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default TrialForm;
