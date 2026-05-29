import React, { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const SampleReceipt = ({ process }) => {
  const { user, confirmReceipt } = useMockStore();
  const [scanValue, setScanValue] = useState('');

  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email);
  const pendingReceipt = myAssignments.filter(ba => ba.status === 'SHIPPED');
  const receivedSamples = myAssignments.filter(ba => ba.status === 'RECEIVED');

  const handleConfirm = (code) => {
    confirmReceipt(process.id, user.email, [code]);
    alert(`Recebimento da amostra ${code} confirmado.`);
  };

  const handleSimulatedScan = () => {
    const ba = myAssignments.find(x => x.blindCode === scanValue && x.status === 'SHIPPED');
    if (ba) {
      handleConfirm(scanValue);
      setScanValue('');
    } else {
      alert('Código inválido, já recebido ou não pertence a este laboratório.');
    }
  };

  return (
    <div className="sample-receipt-flow">
      <div className="receipt-header">
        <h3>Recebimento de Amostras</h3>
        <p className="text-secondary">Confirme a integridade e receba os frascos enviados para o estudo.</p>
      </div>

      <div className="scanner-mock modern-card">
        <div className="scanner-icon">📸</div>
        <p>Aponte a câmera para o QR Code do frasco</p>
        <div className="scanner-input-group">
          <input 
            type="text" 
            placeholder="Simular leitura de código..." 
            value={scanValue}
            onChange={e => setScanValue(e.target.value)}
            className="input-technical"
          />
          <button className="btn btn-primary" onClick={handleSimulatedScan}>Confirmar</button>
        </div>
      </div>

      <div className="sample-grid">
        {myAssignments.map(ba => (
          <div key={ba.id} className={`sample-card modern-card ${ba.status === 'RECEIVED' ? 'received' : 'pending'}`}>
            <div className="sample-status-badge">
              {ba.status === 'RECEIVED' ? 'RECEBIDO' : 'EM TRÂNSITO'}
            </div>
            <div className="sample-info">
              <span className="sample-code">{ba.blindCode}</span>
              <span className="sample-label">Amostra Cega</span>
            </div>
            {ba.status === 'SHIPPED' && (
              <button className="btn btn-tiny btn-outline" onClick={() => handleConfirm(ba.blindCode)}>
                Confirmar Manualmente
              </button>
            )}
            {ba.status === 'RECEIVED' && (
              <div className="receipt-meta">
                <span>Recebido em: {new Date(ba.receivedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .sample-receipt-flow { max-width: 800px; margin: 0 auto; }
        .receipt-header { margin-bottom: 24px; text-align: center; }
        .scanner-mock {
          padding: 32px;
          text-align: center;
          background: #f8fafc;
          border: 2px dashed var(--border-color);
          margin-bottom: 32px;
        }
        .scanner-icon { font-size: 48px; margin-bottom: 16px; }
        .scanner-input-group {
          display: flex;
          gap: 8px;
          max-width: 400px;
          margin: 24px auto 0;
        }
        .sample-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .sample-card {
          padding: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 4px solid var(--border-color);
        }
        .sample-card.received { border-top-color: #009c3b; background: #f0fff4; }
        .sample-card.pending { border-top-color: #f59e0b; }
        .sample-status-badge {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .received .sample-status-badge { background: #009c3b; color: white; }
        .pending .sample-status-badge { background: #f59e0b; color: white; }
        .sample-code { font-size: 20px; font-weight: 700; color: var(--text-primary); display: block; }
        .sample-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; }
        .receipt-meta { font-size: 10px; color: var(--text-tertiary); margin-top: auto; }
        .btn-outline { border: 1px solid var(--primary-color); color: var(--primary-color); background: transparent; }
      `}</style>
    </div>
  );
};

export default SampleReceipt;
