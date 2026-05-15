import React, { useState } from 'react';

const FormPreview = ({ template }) => {
  const [activeTab, setActiveTab] = useState('proponent');

  if (!template) return null;

  return (
    <div className="form-preview" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="preview-tabs" style={{ 
        display: 'flex', 
        padding: '0 12px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        gap: '4px'
      }}>
        <button 
          className={`tab-btn ${activeTab === 'proponent' ? 'active' : ''}`}
          onClick={() => setActiveTab('proponent')}
          style={{
            padding: '16px 20px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            color: activeTab === 'proponent' ? 'var(--primary-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'proponent' ? '3px solid var(--primary-color)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Visão Proponente
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          style={{
            padding: '16px 20px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            color: activeTab === 'ai' ? 'var(--primary-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'ai' ? '3px solid var(--primary-color)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Simulação IA
        </button>
      </div>

      <div className="preview-content" style={{ flex: 1, padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
        {activeTab === 'proponent' ? (
          <div className="proponent-view" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Preview de Submissão
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{template.name}</h3>
            </div>
            
            {template.sections.map(section => (
              <div key={section.id} style={{ 
                marginBottom: '24px', 
                padding: '24px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                backgroundColor: 'var(--bg-primary)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  marginBottom: '20px', 
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
                  {section.name}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {section.fields.map(field => (
                    <div key={field.id} className="form-group">
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>
                        {field.label} {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea className="modern-input" rows="3" disabled placeholder="..." style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}></textarea>
                      ) : field.type === 'select' ? (
                        <select className="modern-input" disabled style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}>
                          <option>Selecione uma opção...</option>
                        </select>
                      ) : (
                        <input type="text" className="modern-input" disabled placeholder="..." style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ai-view" style={{ maxWidth: '600px', margin: '0 auto' }}>
             <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Análise de Inteligência Artificial
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Parecer Estruturado (Simulação)</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {template.sections.filter(s => s.aiPromptConfig?.enabled).map(section => {
                // Try to parse the mock response if it looks like JSON, or just show it as a nice card
                let content = section.aiPromptConfig.mockPreviewResponse;
                let parsed = null;
                try {
                  if (content.trim().startsWith('{')) {
                    parsed = JSON.parse(content);
                  }
                } catch (e) {}

                return (
                  <div key={section.id} style={{ 
                    padding: '20px', 
                    backgroundColor: 'var(--bg-primary)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--primary-color)'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Seção: {section.name}</span>
                      <span style={{ color: 'var(--primary-color)' }}>Validado por IA</span>
                    </div>

                    {parsed ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(parsed).map(([key, value]) => (
                          <div key={key}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                              {typeof value === 'boolean' ? (value ? '✅ Sim' : '❌ Não') : value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '0.9375rem', 
                        color: 'var(--text-primary)', 
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit'
                      }}>
                        {content}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {template.sections.filter(s => s.aiPromptConfig?.enabled).length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '48px 24px', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.875rem',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <p>Nenhuma seção configurada para validação automática nesta simulação.</p>
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
