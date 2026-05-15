import React, { useState } from 'react';
import AiPromptEditor from './AiPromptEditor';
import useFormBuilderStore from '../../../modules/formBuilder/store/formBuilderStore';

const SectionEditor = ({ template }) => {
  const { updateSection, updateAiConfig } = useFormBuilderStore();
  const [expandedSection, setExpandedSection] = useState(template.sections[0]?.id);

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="section-editor">
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Estrutura do Formulário</h2>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{template.name}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '600px' }}>
          Defina as seções, campos e critérios de validação automática para este template.
        </p>
      </div>

      <div className="sections-container">
        {template.sections.sort((a, b) => a.order - b.order).map((section) => (
          <div key={section.id} className={`builder-card ${expandedSection === section.id ? 'expanded' : ''}`}>
            <div className="builder-card-header" onClick={() => toggleSection(section.id)} style={{ cursor: 'pointer', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  backgroundColor: expandedSection === section.id ? 'var(--primary-color)' : 'var(--bg-primary)', 
                  color: expandedSection === section.id ? 'white' : 'var(--text-secondary)', 
                  border: expandedSection === section.id ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '8px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}>
                  {section.order}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: expandedSection === section.id ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                    {section.name}
                  </div>
                </div>
                {section.isRequired && <span className="badge badge-tiny" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Obrigatória</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {section.fields.length} campos
                </div>
                <svg 
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ 
                    transform: expandedSection === section.id ? 'rotate(180deg)' : 'none', 
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: expandedSection === section.id ? 'var(--primary-color)' : 'var(--text-secondary)'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="builder-card-content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                    Identificação da Seção
                  </label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    value={section.name} 
                    onChange={(e) => updateSection(template.id, section.id, { name: e.target.value })}
                    placeholder="Ex: Justificativa Técnica"
                  />
                </div>

                <div className="fields-list" style={{ marginTop: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                      Campos de Coleta
                    </h4>
                    <button className="btn-secondary btn-tiny">+ Novo Campo</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {section.fields.map(field => (
                      <div key={field.id} style={{ 
                        padding: '16px', 
                        backgroundColor: 'var(--bg-primary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s'
                      }}
                      className="field-item-editor"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="8" y1="6" x2="21" y2="6"></line>
                              <line x1="8" y1="12" x2="21" y2="12"></line>
                              <line x1="8" y1="18" x2="21" y2="18"></line>
                              <line x1="3" y1="6" x2="3.01" y2="6"></line>
                              <line x1="3" y1="12" x2="3.01" y2="12"></line>
                              <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{field.label}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 500 }}>{field.type}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-tiny" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Configurar</button>
                          <button className="btn-tiny" style={{ color: '#ef4444', backgroundColor: 'transparent' }}>Remover</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px dashed var(--border-color)' }}>
                  <AiPromptEditor 
                    templateId={template.id}
                    section={section}
                    onUpdate={(config) => updateAiConfig(template.id, section.id, config)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        <button className="btn-primary" style={{ 
          width: '100%', 
          padding: '20px', 
          borderStyle: 'dashed', 
          backgroundColor: 'transparent', 
          color: 'var(--primary-color)', 
          borderColor: 'var(--primary-color)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Adicionar Nova Seção
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .field-item-editor:hover {
          border-color: var(--primary-color) !important;
        }
      `}</style>
    </div>
  );
};

export default SectionEditor;
