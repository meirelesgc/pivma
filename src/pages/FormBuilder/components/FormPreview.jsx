import React, { useState } from 'react';

const FormPreview = ({ template }) => {
  const [activeTab, setActiveTab] = useState('proponent');

  if (!template) return null;

  return (
    <div className="form-preview" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="preview-tabs" style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <button 
          className={`tab-btn ${activeTab === 'proponent' ? 'active' : ''}`}
          onClick={() => setActiveTab('proponent')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: activeTab === 'proponent' ? 'var(--primary-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'proponent' ? '2px solid var(--primary-color)' : '2px solid transparent'
          }}
        >
          Visão do Proponente
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: activeTab === 'ai' ? 'var(--primary-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'ai' ? '2px solid var(--primary-color)' : '2px solid transparent'
          }}
        >
          Resposta da IA
        </button>
      </div>

      <div className="preview-content" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'proponent' ? (
          <div className="proponent-view">
            <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>{template.name}</h3>
            {template.sections.map(section => (
              <div key={section.id} style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
                <h4 style={{ fontSize: '0.875rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  {section.name}
                </h4>
                {section.fields.map(field => (
                  <div key={field.id} className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>
                      {field.label} {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea className="modern-input" rows="2" disabled></textarea>
                    ) : field.type === 'select' ? (
                      <select className="modern-input" disabled>
                        <option>Selecione...</option>
                        {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type="text" className="modern-input" disabled />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="ai-view">
            <div style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h3 style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                Simulação de Resposta Estruturada
              </h3>
              
              {template.sections.filter(s => s.aiPromptConfig?.enabled).map(section => (
                <div key={section.id} style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    SEÇÃO: {section.name.toUpperCase()}
                  </div>
                  <div style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid var(--border-color)'
                  }}>
                    {section.aiPromptConfig.mockPreviewResponse}
                  </div>
                </div>
              ))}
              
              {template.sections.filter(s => s.aiPromptConfig?.enabled).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Nenhuma seção com validação IA habilitada.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPreview;
