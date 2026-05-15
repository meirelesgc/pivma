import { useState } from 'react';
import useMockStore from '../../../store/useMockStore';
import { PROCESS_STATES } from '../../../config/processStates';
import FieldReview from './FieldReview';

const MethodForm = ({ process }) => {
  const { updateProcessData, submitToTriage, user } = useMockStore();
  const [formData, setFormData] = useState({ ...process });
  const [prevProcessId, setPrevProcessId] = useState(process.id);

  if (process.id !== prevProcessId) {
    setPrevProcessId(process.id);
    setFormData({ ...process });
  }

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
      <div className={`field-wrapper ${hasPending ? 'has-pending-comments' : ''} ${comments.length > 0 ? 'has-comments' : ''}`} style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{label}</span>
          {hasPending && <span className="pendency-badge" style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>PENDENTE</span>}
        </label>
        <div className="form-group" style={{ position: 'relative' }}>
          {isTextArea ? (
            <textarea 
              name={name} 
              placeholder={placeholder} 
              rows={name === 'description' ? '5' : '3'} 
              value={formData[name] || ''} 
              onChange={handleChange}
              disabled={isReadOnly}
              style={{ padding: '16px', fontSize: '0.9375rem', lineHeight: '1.5', borderRadius: '12px', backgroundColor: isReadOnly ? 'var(--bg-secondary)' : 'var(--bg-primary)' }}
            />
          ) : (
            <input 
              type={type} 
              name={name} 
              placeholder={placeholder} 
              value={formData[name] || ''} 
              onChange={handleChange}
              disabled={isReadOnly}
              style={{ height: '48px', padding: '0 16px', fontSize: '0.9375rem', borderRadius: '12px', backgroundColor: isReadOnly ? 'var(--bg-secondary)' : 'var(--bg-primary)' }}
            />
          )}
          <div style={{ position: 'absolute', right: '-45px', top: '12px' }}>
            <FieldReview processId={process.id} fieldId={fieldId} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`method-form-container modern-card ${isReviewMode ? 'review-mode' : ''}`} style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      {isReviewMode && (
        <div className="review-mode-indicator" style={{ margin: '0', borderRadius: '0', width: '100%', justifyContent: 'center', padding: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          MODO DE REVISÃO INSTITUCIONAL ATIVO
        </div>
      )}

      <div className="form-header" style={{ padding: '32px 40px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', marginBottom: '0' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Dados Técnicos do Método</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Preencha as informações fundamentais para a triagem inicial</p>
        </div>
        {!isReadOnly && user.role === 'Proponente' && (
          <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700 }}>
            Enviar Submissão
          </button>
        )}
      </div>

      <form className="pivma-form" style={{ padding: '40px', gap: '40px' }}>
        <div className="form-section-modern">
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '20px', letterSpacing: '0.1em' }}>
            01. Identificação Geral
          </div>
          {renderField('Nome do Método', 'name', 'text', 'Ex: Método de Irritação Ocular HCE')}
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {renderField('Instituição Proponente', 'institution', 'text', 'Ex: Instituto de BioPesquisa')}
            {renderField('Responsável Técnico', 'technicalLead', 'text', 'Ex: Dr. Roberto Silva')}
          </div>
        </div>

        <div className="form-section-modern" style={{ paddingTop: '40px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '20px', letterSpacing: '0.1em' }}>
            02. Classificação Científica
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="field-wrapper" style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Tipo de Submissão</label>
              <div style={{ position: 'relative' }}>
                <select 
                  name="submissionType" 
                  value={formData.submissionType || ''} 
                  onChange={handleChange} 
                  disabled={isReadOnly}
                  style={{ height: '48px', padding: '0 16px', fontSize: '0.9375rem', borderRadius: '12px', backgroundColor: isReadOnly ? 'var(--bg-secondary)' : 'var(--bg-primary)' }}
                >
                  <option value="">Selecione...</option>
                  <option value="Validação Completa">Validação Completa</option>
                  <option value="Captura de Dados">Captura de Dados</option>
                  <option value="Mecanicista">Mecanicista</option>
                </select>
                <div style={{ position: 'absolute', right: '-45px', top: '12px' }}>
                  <FieldReview processId={process.id} fieldId="field_submissionType" />
                </div>
              </div>
            </div>
            {renderField('Área Científica', 'scientificArea', 'text', 'Ex: Toxicologia In Vitro')}
          </div>
        </div>

        <div className="form-section-modern" style={{ paddingTop: '40px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '20px', letterSpacing: '0.1em' }}>
            03. Detalhamento e Objetivos
          </div>
          {renderField('Descrição detalhada do método', 'description', 'text', 'Descreva o método...', true)}
          {renderField('Objetivo regulatório e aplicabilidade', 'objective', 'text', 'Objetivo e aplicabilidade...', true)}
        </div>

        <div className="form-section-modern" style={{ paddingTop: '40px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '20px', letterSpacing: '0.1em' }}>
            04. Documentação Comprobatória
          </div>
          <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { label: 'Protocolo Padronizado', id: 'field_upload_protocol' },
              { label: 'Artigos Científicos', id: 'field_upload_articles' },
              { label: 'Dados Preliminares', id: 'field_upload_preliminary' }
            ].map(item => (
              <div key={item.id} className="upload-item" style={{ 
                background: 'var(--bg-secondary)', 
                border: '2px dashed var(--border-color)', 
                padding: '24px', 
                borderRadius: '16px',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'block' }}>{item.label}</span>
                <button type="button" className="btn btn-secondary btn-tiny" disabled={isReadOnly} style={{ borderRadius: '8px' }}>+ Upload</button>
                <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
                  <FieldReview processId={process.id} fieldId={item.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
      
      {isReadOnly && (
        <div className="form-overlay-info" style={{ margin: '0 40px 40px 40px', padding: '16px 24px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary-color)' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Formulário em modo leitura.</span>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>Status atual: {PROCESS_STATES[currentState]?.label || currentState}.</span>
        </div>
      )}
    </div>
  );
};

export default MethodForm;
