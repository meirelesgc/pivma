import { useState, useEffect } from 'react';
import useMockStore from '../../../store/useMockStore';

const MethodForm = ({ process }) => {
  const { updateProcessData, submitToTriage } = useMockStore();
  const [formData, setFormData] = useState({ ...process });

  // Sync with store if process changes externally
  useEffect(() => {
    setFormData({ ...process });
  }, [process]);

  const isReadOnly = ['Em Triagem (IA)', 'Contestado (Aguardando Validação BraCVAM)'].includes(process.status) || 
                     process.bracvamStatus === 'Apto para Análise Preliminar';

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    // Debounced or on-blur save would be better, but for mock, let's save on change
    updateProcessData(process.id, newData);
  };

  const handleSubmit = () => {
    if (window.confirm('Deseja enviar este método para triagem oficial? O formulário será bloqueado durante a análise.')) {
      submitToTriage(process.id);
    }
  };

  return (
    <div className="method-form-container modern-card">
      <div className="form-header">
        <h3>Etapa A — Dados do Método</h3>
        {!isReadOnly && (
          <button className="btn btn-primary btn-small" onClick={handleSubmit}>
            Enviar Submissão
          </button>
        )}
      </div>

      <form className="pivma-form">
        <div className="form-section">
          <label>Identificação</label>
          <div className="form-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Nome do Método" 
              value={formData.name || ''} 
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input 
                type="text" 
                name="institution" 
                placeholder="Instituição Proponente" 
                value={formData.institution || ''} 
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
            <div className="form-group">
              <input 
                type="text" 
                name="technicalLead" 
                placeholder="Responsável Técnico" 
                value={formData.technicalLead || ''} 
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <label>Classificação</label>
          <div className="form-row">
            <select name="submissionType" value={formData.submissionType || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Tipo de Submissão</option>
              <option value="Validação Completa">Validação Completa</option>
              <option value="Captura de Dados">Captura de Dados</option>
              <option value="Mecanicista">Mecanicista</option>
            </select>
            <input 
              type="text" 
              name="scientificArea" 
              placeholder="Área Científica" 
              value={formData.scientificArea || ''} 
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-section">
          <label>Descrição e Objetivos</label>
          <textarea 
            name="description" 
            placeholder="Descrição detalhada do método..." 
            rows="4" 
            value={formData.description || ''} 
            onChange={handleChange}
            disabled={isReadOnly}
          />
          <textarea 
            name="objective" 
            placeholder="Objetivo e aplicabilidade regulatória..." 
            rows="3" 
            value={formData.objective || ''} 
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>

        <div className="form-section">
          <label>Documentação (Anexos)</label>
          <div className="upload-grid">
            <div className="upload-item">
              <span>Protocolo Padronizado</span>
              <button type="button" className="btn-upload" disabled={isReadOnly}>+ Upload</button>
            </div>
            <div className="upload-item">
              <span>Artigos Científicos</span>
              <button type="button" className="btn-upload" disabled={isReadOnly}>+ Upload</button>
            </div>
            <div className="upload-item">
              <span>Dados Preliminares</span>
              <button type="button" className="btn-upload" disabled={isReadOnly}>+ Upload</button>
            </div>
          </div>
        </div>
      </form>
      
      {isReadOnly && (
        <div className="form-overlay-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Este formulário está bloqueado para edição durante a fase de {process.status.includes('Triagem') ? 'análise' : 'revisão'}.
        </div>
      )}
    </div>
  );
};

export default MethodForm;
