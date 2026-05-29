import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import { MOCK_ENDPOINTS, METHOD_TYPES } from '../../../../../modules/protocolDefinition/store/protocolDefinitionMock';

const GeneralInfoStep = () => {
  const { protocol, setProtocol } = useProtocolDefinitionStore();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProtocol({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="general-info-step">
      <div className="form-section">
        <h3>Identificação do Protocolo</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nome do Protocolo</label>
            <input 
              type="text" 
              name="name" 
              value={protocol.name} 
              onChange={handleChange} 
              placeholder="Ex: Retcam OECD 492"
            />
          </div>
          <div className="form-group">
            <label>Código Interno</label>
            <input 
              type="text" 
              name="code" 
              value={protocol.code} 
              onChange={handleChange} 
              placeholder="Ex: PROT-2026-004"
            />
          </div>
          <div className="form-group">
            <label>Endpoint Relacionado</label>
            <select name="endpointId" value={protocol.endpointId} onChange={handleChange}>
              <option value="">Selecione um endpoint...</option>
              {MOCK_ENDPOINTS.map(ep => (
                <option key={ep.id} value={ep.id}>{ep.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Método</label>
            <select name="methodType" value={protocol.methodType} onChange={handleChange}>
              <option value="">Selecione o tipo...</option>
              {METHOD_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Versão do Template</label>
            <input 
              type="text" 
              name="version" 
              value={protocol.version} 
              onChange={handleChange} 
              placeholder="v1.0"
            />
          </div>
          <div className="form-group">
            <label>Quantidade Esperada de Substâncias</label>
            <input 
              type="number" 
              name="expectedSubstances" 
              value={protocol.expectedSubstances} 
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Detalhes Técnicos</h3>
        <div className="form-group">
          <label>Descrição Técnica</label>
          <textarea 
            name="description" 
            value={protocol.description} 
            onChange={handleChange} 
            rows="4"
            placeholder="Breve explicação do objetivo do protocolo..."
          />
        </div>
        <div className="form-group checkbox-group" style={{ marginTop: '16px' }}>
          <input 
            type="checkbox" 
            id="allowAttachments" 
            name="allowAttachments" 
            checked={protocol.allowAttachments} 
            onChange={handleChange} 
          />
          <label htmlFor="allowAttachments">Permitir anexos/imagens no protocolo?</label>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoStep;
