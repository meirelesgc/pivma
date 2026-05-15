import React, { useState } from 'react';
import AiPromptEditor from './AiPromptEditor';
import useFormBuilderStore from '../../../modules/formBuilder/store/formBuilderStore';

const SectionEditor = ({ template, mode = 'structure' }) => {
  const { updateSection, updateAiConfig } = useFormBuilderStore();
  const [expandedSection, setExpandedSection] = useState(template.sections[0]?.id);

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const renderSectionContent = (section) => {
    switch (mode) {
      case 'structure':
        return (
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Identificação da Seção
            </label>
            <input 
              type="text" 
              className="modern-input" 
              value={section.name} 
              onChange={(e) => updateSection(template.id, section.id, { name: e.target.value })}
              placeholder="Ex: Justificativa Técnica"
              style={{ height: '40px', fontSize: '0.875rem' }}
            />
          </div>
        );
      case 'rules':
        return (
          <div className="fields-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                Campos de Coleta
              </h4>
              <button className="btn-secondary btn-tiny" style={{ padding: '4px 8px' }}>+ Novo Campo</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.fields.map(field => (
                <div key={field.id} style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{field.label}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{field.type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-tiny" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', padding: '2px 6px' }}>Editar</button>
                    <button className="btn-tiny" style={{ color: '#ef4444', backgroundColor: 'transparent', padding: '2px 6px' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'ai':
        return (
          <AiPromptEditor 
            templateId={template.id}
            section={section}
            onUpdate={(config) => updateAiConfig(template.id, section.id, config)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="section-editor">
      <div className="sections-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {template.sections.sort((a, b) => a.order - b.order).map((section) => (
          <div key={section.id} className={`builder-card ${expandedSection === section.id ? 'expanded' : ''}`} style={{ marginBottom: '0' }}>
            <div className="builder-card-header" onClick={() => toggleSection(section.id)} style={{ cursor: 'pointer', padding: '12px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: expandedSection === section.id ? 'var(--primary-color)' : 'var(--bg-primary)', 
                  color: expandedSection === section.id ? 'white' : 'var(--text-secondary)', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: expandedSection === section.id ? 'none' : '1px solid var(--border-color)'
                }}>
                  {section.order}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{section.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {mode === 'ai' ? (section.aiPromptConfig?.enabled ? 'Ativo' : 'Desativado') : `${section.fields.length} campos`}
                </div>
                <svg 
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: expandedSection === section.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="builder-card-content" style={{ padding: '20px' }}>
                {renderSectionContent(section)}
              </div>
            )}
          </div>
        ))}
        
        {mode === 'structure' && (
          <button className="btn-primary" style={{ 
            width: '100%', 
            padding: '12px', 
            borderStyle: 'dashed', 
            backgroundColor: 'transparent', 
            color: 'var(--primary-color)', 
            borderColor: 'var(--primary-color)', 
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: '10px'
          }}>
            + Adicionar Nova Seção
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionEditor;
