import { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiTruck 
} from 'react-icons/fi';

const SampleReceipt = ({ process }) => {
  const { user, confirmReceipt } = useMockStore();
  const [selectedCodes, setSelectedCodes] = useState([]);
  
  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email);
  const myShipments = (process.shipments || []).filter(s => s.labEmail === user.email);

  const handleConfirm = () => {
    confirmReceipt(process.id, user.email, selectedCodes);
    setSelectedCodes([]);
  };

  const toggleCode = (code) => {
    setSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="sample-receipt">
      <div className="receipt-grid">
        <div className="pending-receipts modern-card">
          <h4>Aguardando Confirmação</h4>
          <p className="text-secondary text-smaller mb-4">
            Confirme a integridade física e o código de cada amostra recebida.
          </p>
          
          <div className="codes-checklist">
            {myAssignments.filter(ba => ba.status === 'SHIPPED').map(ba => (
              <div 
                key={ba.id} 
                className={`code-check-item ${selectedCodes.includes(ba.blindCode) ? 'selected' : ''}`}
                onClick={() => toggleCode(ba.blindCode)}
              >
                <div className="check-box">
                  {selectedCodes.includes(ba.blindCode) && <FiCheckCircle />}
                </div>
                <div className="code-info">
                  <span className="code-label">{ba.blindCode}</span>
                  <span className="code-hint">Verifique o lacre de segurança</span>
                </div>
              </div>
            ))}
            
            {myAssignments.filter(ba => ba.status === 'SHIPPED').length === 0 && (
              <div className="empty-state">
                <FiPackage size={40} className="text-tertiary mb-2" />
                <p>Nenhuma amostra pendente de recebimento.</p>
              </div>
            )}
          </div>

          <button 
            className="btn btn-primary btn-block mt-4"
            disabled={selectedCodes.length === 0}
            onClick={handleConfirm}
          >
            Confirmar Recebimento de {selectedCodes.length} Amostras
          </button>
        </div>

        <div className="shipment-history modern-card">
          <h4>Rastreio de Envios</h4>
          <div className="shipment-list mt-3">
            {myShipments.map(shipment => (
              <div key={shipment.id} className="shipment-item">
                <div className="ship-header">
                  <FiTruck />
                  <strong>#{shipment.trackingNumber}</strong>
                  <span className={`ship-badge ${shipment.status.toLowerCase()}`}>{shipment.status}</span>
                </div>
                <div className="ship-body">
                  <div className="ship-meta">Enviado em: {new Date(shipment.sentAt).toLocaleDateString()}</div>
                  <div className="ship-meta">Documentação: {shipment.documents?.length || 0} anexo(s)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .receipt-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
        .codes-checklist { display: flex; flex-direction: column; gap: 12px; }
        .code-check-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .code-check-item:hover { border-color: var(--primary-color); background: #f1f5f9; }
        .code-check-item.selected { border-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.05); }
        
        .check-box { width: 24px; height: 24px; border: 2px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-size: 18px; background: white; }
        .code-check-item.selected .check-box { border-color: var(--primary-color); }
        
        .code-info { display: flex; flex-direction: column; }
        .code-label { font-weight: 700; font-family: monospace; font-size: 18px; }
        .code-hint { font-size: 11px; color: var(--text-tertiary); }
        
        .shipment-list { display: flex; flex-direction: column; gap: 12px; }
        .shipment-item { padding: 16px; background: white; border: 1px solid var(--border-color); border-radius: 8px; }
        .ship-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; }
        .ship-badge { margin-left: auto; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; }
        .ship-badge.shipped { background: #e6f7ed; color: #009c3b; }
        .ship-badge.received { background: #f1f5f9; color: var(--text-secondary); }
        .ship-meta { font-size: 12px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
};

export default SampleReceipt;
