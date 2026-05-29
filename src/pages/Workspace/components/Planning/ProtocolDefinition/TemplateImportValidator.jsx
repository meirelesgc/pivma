import React, { useState } from 'react';

const TemplateImportValidator = () => {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);

  const simulateValidation = () => {
    setValidating(true);
    setResult(null);
    setTimeout(() => {
      setValidating(false);
      setResult({
        status: 'success',
        errors: [],
        warnings: [
          { field: 'Temperatura', message: 'Alguns valores estão próximos do limite (7.8°C)' }
        ],
        info: 'Estrutura 100% compatível com a versão v1.0.'
      });
    }, 2000);
  };

  return (
    <div className="import-validator" style={{ marginTop: '40px', padding: '24px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ddd' }}>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Simulador de Importação</h4>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
          Faça um upload fictício para validar se a estrutura gerada aceita os dados conforme as regras configuradas.
        </p>
        
        <button 
          className="btn-primary" 
          onClick={simulateValidation}
          disabled={validating}
          style={{ padding: '10px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {validating ? 'Validando estrutura...' : 'Simular Upload (XLSX)'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'white', borderRadius: '6px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ 
              width: '12px', height: '12px', borderRadius: '50%', 
              background: result.status === 'success' ? '#28a745' : '#ff4d4f' 
            }} />
            <strong style={{ fontSize: '14px' }}>Resultado da Simulação: {result.status === 'success' ? 'Compatível' : 'Incompatível'}</strong>
          </div>
          
          <div style={{ fontSize: '13px', color: '#555' }}>
            <p style={{ margin: '4px 0', color: '#28a745' }}>✓ {result.info}</p>
            {result.warnings.map((w, i) => (
              <p key={i} style={{ margin: '4px 0', color: '#faad14' }}>! Alerta: {w.message}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateImportValidator;
