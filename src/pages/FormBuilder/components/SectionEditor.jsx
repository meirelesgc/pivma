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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Editor de Seções</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Configure a ordem, campos e critérios de IA para cada parte do formulário.
        </p>
      </div>

      <div className="sections-container">
        {template.sections.sort((a, b) => a.order - b.order).map((section) => (
          <div key={section.id} className="builder-card">
            <div className="builder-card-header" onClick={() => toggleSection(section.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: 'var(--primary-color)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {section.order}
                </span>
                <span style={{ fontWeight: 600 }}>{section.name}</span>
                {section.isRequired && <span className="badge badge-tiny" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Obrigatória</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {section.fields.length} campos
                </div>
                <svg 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: expandedSection === section.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="builder-card-content">
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Nome da Seção</label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    value={section.name} 
                    onChange={(e) => updateSection(template.id, section.id, { name: e.target.value })}
                  />
                </div>

                <div className="fields-list" style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Campos da Seção</h4>
                  {section.fields.map(field => (
                    <div key={field.id} style={{ 
                      padding: '12px', 
                      backgroundColor: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{field.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tipo: {field.type}</div>
                      </div>
                      <button className="btn-tiny">Editar</button>
                    </div>
                  ))}
                  <button className="btn-secondary btn-tiny" style={{ marginTop: '8px' }}>+ Adicionar Campo</button>
                </div>

                <div style={{ marginTop: '32px' }}>
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
        
        <button className="btn-primary" style={{ width: '100%', padding: '16px', borderStyle: 'dashed', backgroundColor: 'transparent', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
          + Adicionar Nova Seção
        </button>
      </div>
    </div>
  );
};

export default SectionEditor;
