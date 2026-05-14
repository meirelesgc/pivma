import { useState, useEffect } from 'react';
import useMockStore from '../../../store/useMockStore';
import { PROCESS_STATES } from '../../../config/processStates';
import FieldReview from './FieldReview';

const MethodForm = ({ process }) => {
  const { updateProcessData, submitToTriage, user } = useMockStore();
  const [formData, setFormData] = useState({ ...process });

  // Sync with store if process changes externally
  useEffect(() => {
    setFormData({ ...process });
  }, [process]);

  const currentState = process.currentState || 'RASCUNHO';
  const isReadOnly = !['RASCUNHO', 'PENDENTE_AJUSTE'].includes(currentState);
  const isReviewMode = user.role === 'Admin' && ['SUBMETIDO', 'TRIAGEM_IA', 'CONTESTADO'].includes(currentState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    updateProcessData(process.id, newData);
  };

  const handleSubmit = () => {
    if (window.confirm('Deseja enviar este método para triagem oficial? O formulário será bloqueado durante a análise.')) {
      submitToTriage(process.id);
    }
  };

  const renderField = (label, name, type = 'text', placeholder = '', isTextArea = false) => {
    const fieldId = `field_${name}`;
    const comments = process.comments?.[fieldId] || [];
    const hasPending = comments.some(c => c.status === 'pending');

    return (
      <div className={`field-wrapper ${hasPending ? 'has-pending-comments' : ''} ${comments.length > 0 ? 'has-comments' : ''}`}>
        <label>
          {label}
          {hasPending && <span className="pendency-badge">PENDENTE</span>}
        </label>
        <div className="form-group">
          {isTextArea ? (
            <textarea 
              name={name} 
              placeholder={placeholder} 
              rows={name === 'description' ? '4' : '3'} 
              value={formData[name] || ''} 
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ) : (
            <input 
              type={type} 
              name={name} 
              placeholder={placeholder} 
              value={formData[name] || ''} 
              onChange={handleChange}
              disabled={isReadOnly}
            />
          )}
          <FieldReview processId={process.id} fieldId={fieldId} />
        </div>
      </div>
    );
  };

  return (
    <div className={`method-form-container modern-card ${isReviewMode ? 'review-mode' : ''}`}>
      {isReviewMode && (
        <div className="review-mode-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          MODO DE REVISÃO INSTITUCIONAL
        </div>
      )}

      <div className="form-header">
        <h3>Etapa A — Dados do Método</h3>
        {!isReadOnly && user.role === 'Proponente' && (
          <button className="btn btn-primary btn-small" onClick={handleSubmit}>
            Enviar Submissão
          </button>
        )}
      </div>

      <form className="pivma-form">
        <div className="form-section">
          <label>Identificação</label>
          {renderField('Nome do Método', 'name', 'text', 'Ex: Método de Irritação Ocular HCE')}
          <div className="form-row">
            {renderField('Instituição Proponente', 'institution', 'text', 'Ex: Instituto de BioPesquisa')}
            {renderField('Responsável Técnico', 'technicalLead', 'text', 'Ex: Dr. Roberto Silva')}
          </div>
        </div>

        <div className="form-section">
          <label>Classificação</label>
          <div className="form-row">
            <div className="field-wrapper">
              <label>Tipo de Submissão</label>
              <select name="submissionType" value={formData.submissionType || ''} onChange={handleChange} disabled={isReadOnly}>
                <option value="">Selecione...</option>
                <option value="Validação Completa">Validação Completa</option>
                <option value="Captura de Dados">Captura de Dados</option>
                <option value="Mecanicista">Mecanicista</option>
              </select>
              <FieldReview processId={process.id} fieldId="field_submissionType" />
            </div>
            {renderField('Área Científica', 'scientificArea', 'text', 'Ex: Toxicologia In Vitro')}
          </div>
        </div>

        <div className="form-section">
          <label>Descrição e Objetivos</label>
          {renderField('Descrição detalhada', 'description', 'text', 'Descreva o método...', true)}
          {renderField('Objetivo regulatório', 'objective', 'text', 'Objetivo e aplicabilidade...', true)}
        </div>

        <div className="form-section">
          <label>Documentação (Anexos)</label>
          <div className="upload-grid">
            <div className="upload-item">
              <span>Protocolo Padronizado</span>
              <button type="button" className="btn-upload" disabled={isReadOnly}>+ Upload</button>
              <FieldReview processId={process.id} fieldId="field_upload_protocol" />
            </div>
            <div className="upload-item">
              <span>Artigos Científicos</span>
              <button type="button" className="btn-upload" disabled={isReadOnly}>+ Upload</button>
              <FieldReview processId={process.id} fieldId="field_upload_articles" />
            </div>
            <div className="upload-item">
              <span>Dados Preliminares</span>
              <button type="button" className="btn-upload" disabled={isReadOnly}>+ Upload</button>
              <FieldReview processId={process.id} fieldId="field_upload_preliminary" />
            </div>
          </div>
        </div>
      </form>
      
      {isReadOnly && (
        <div className="form-overlay-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Este formulário está bloqueado para edição. Status: {PROCESS_STATES[currentState]?.label || currentState}.
        </div>
      )}
    </div>
  );
};

export default MethodForm;
