import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';

const VersioningPanel = () => {
  const { protocol } = useProtocolDefinitionStore();

  return (
    <div className="versioning-panel">
      <div className="form-section">
        <h3>Publicação e Versionamento</h3>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          <div style={{ flex: 1, padding: '24px', background: '#f0f7ff', borderRadius: '12px', border: '1px solid #cce3ff' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0056b3' }}>Status Atual: Rascunho</h4>
            <p style={{ fontSize: '14px', color: '#444', marginBottom: '20px' }}>
              Este protocolo (v{protocol.version}) ainda está em fase de edição. 
              Ao publicar, ele será "congelado" e disponibilizado para os laboratórios.
            </p>
            <button style={{ padding: '12px 24px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Publicar Protocolo Oficial
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '24px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Gerar Nova Versão</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Cria uma cópia deste protocolo incrementando a versão para ajustes pós-publicação.
            </p>
            <button style={{ padding: '12px 24px', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Clonar como v1.1
            </button>
          </div>
        </div>

        <h4>Histórico de Versões</h4>
        <div className="list-items" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
          <div className="list-item">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold' }}>v1.0 (Atual)</span>
              <span style={{ fontSize: '12px', color: '#999' }}>Criado em 29/05/2026 por Dr. Carlos Santos</span>
            </div>
            <span className="badge-type" style={{ background: '#fff7e6', color: '#d46b08' }}>Rascunho</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersioningPanel;
