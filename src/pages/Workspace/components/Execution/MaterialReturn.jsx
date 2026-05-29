import { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';
import { 
  FiAlertTriangle, 
  FiCheckCircle 
} from 'react-icons/fi';

const MaterialReturn = ({ process }) => {
  const { user, registerMaterialReturn } = useMockStore();
  const [returnData, setReturnData] = useState({
    items: [
      { id: 'it1', label: 'Amostras Remanescentes', status: 'pending' },
      { id: 'it2', label: 'Documentação BPL (Cópia)', status: 'pending' },
      { id: 'it3', label: 'Kits de Reagentes Não Utilizados', status: 'pending' }
    ],
    trackingNumber: '',
    notes: ''
  });

  const existingReturn = process.materialReturns?.[user.email];

  const handleToggleItem = (itemId) => {
    setReturnData(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === itemId 
        ? { ...it, status: it.status === 'pending' ? 'confirmed' : 'pending' } 
        : it
      )
    }));
  };

  const handleSubmit = () => {
    registerMaterialReturn(process.id, user.email, returnData);
  };

  return (
    <div className="material-return">
      {existingReturn ? (
        <div className="return-success-view modern-card">
          <FiCheckCircle size={48} className="text-success mb-3" />
          <h4>Devolução Registrada</h4>
          <p className="text-secondary">O protocolo de devolução de materiais foi concluído com sucesso.</p>
          <div className="return-details mt-4">
            <div className="detail-row">
              <span>Data de Devolução:</span>
              <strong>{new Date(existingReturn.returnedAt).toLocaleString()}</strong>
            </div>
            <div className="detail-row">
              <span>Rastreio:</span>
              <strong>{existingReturn.trackingNumber}</strong>
            </div>
          </div>
          <button className="btn btn-outline-primary mt-4">Ver Comprovante</button>
        </div>
      ) : (
        <div className="return-wizard-view">
          <div className="info-banner warning mb-5">
            <FiAlertTriangle />
            <div>
              <strong>Requisito GLP:</strong> Todos os materiais distribuídos devem ser devolvidos ou descartados 
              conforme instruções do Protocolo. O descarte deve ser documentado.
            </div>
          </div>

          <div className="return-grid">
            <div className="return-checklist modern-card">
              <div className="card-header-flex mb-4">
                <h4 className="m-0">Checklist de Devolução</h4>
                <button 
                  className="btn btn-tiny btn-outline-primary"
                  onClick={() => setReturnData(prev => ({ ...prev, items: prev.items.map(i => ({ ...i, status: 'confirmed' })) }))}
                >
                  Confirmar Tudo
                </button>
              </div>
              <div className="checklist-items">
                {returnData.items.map(item => (
                  <div 
                    key={item.id} 
                    className={`checklist-item ${item.status === 'confirmed' ? 'active' : ''}`}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <div className="item-status">
                      {item.status === 'confirmed' ? <FiCheckCircle /> : <div className="dot" />}
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.status !== 'confirmed' && (
                      <button className="btn btn-tiny btn-primary">Confirmar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="return-form modern-card">
              <h4>Dados do Envio</h4>
              <div className="form-group mt-4">
                <label>Número de Rastreio / Protocolo</label>
                <input 
                  type="text" 
                  className="input-technical" 
                  placeholder="Ex: BR123456789"
                  value={returnData.trackingNumber}
                  onChange={e => setReturnData({...returnData, trackingNumber: e.target.value})}
                />
              </div>
              <div className="form-group mt-4">
                <label>Observações de Descarte/Devolução</label>
                <textarea 
                  className="input-technical" 
                  rows="5"
                  placeholder="Descreva se algum item foi descartado localmente..."
                  value={returnData.notes}
                  onChange={e => setReturnData({...returnData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="mt-5">
                <button 
                  className="btn btn-success btn-block btn-lg"
                  disabled={!returnData.trackingNumber || returnData.items.some(i => i.status === 'pending')}
                  onClick={handleSubmit}
                >
                  Confirmar e Registrar Devolução
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .material-return { padding: 12px 0; }
        .return-wizard-view { display: flex; flex-direction: column; gap: 40px; }
        .return-success-view { text-align: center; padding: 64px; max-width: 500px; margin: 0 auto; }
        .return-details { background: #f8fafc; padding: 24px; border-radius: 12px; text-align: left; }
        .detail-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; }
        
        .return-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .card-header-flex { display: flex; justify-content: space-between; align-items: center; }
        
        .checklist-items { display: flex; flex-direction: column; gap: 16px; }
        .checklist-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .checklist-item:hover { border-color: var(--primary-color); }
        .checklist-item.active { background: #e6f7ed; border-color: #009c3b; color: #009c3b; font-weight: 600; }
        .item-status { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .dot { width: 10px; height: 10px; background: #cbd5e1; border-radius: 50%; }
        
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-secondary); }
        .btn-block { width: 100%; }
        .mt-5 { margin-top: 32px; }
        .mb-5 { margin-bottom: 32px; }
      `}</style>
    </div>
  );
};

export default MaterialReturn;
