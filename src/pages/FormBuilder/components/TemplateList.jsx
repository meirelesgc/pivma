import React from 'react';
import { METHOD_TYPES } from '../../../modules/formBuilder/store/mockData';

const TemplateList = ({ templates, selectedId, onSelect }) => {
  return (
    <div className="template-list">
      <div className="list-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Templates de Submissão
        </h3>
      </div>
      <div className="list-items">
        {templates.map(template => {
          const typeInfo = METHOD_TYPES[template.methodType];
          return (
            <div 
              key={template.id}
              className={`template-item ${selectedId === template.id ? 'active' : ''}`}
              onClick={() => onSelect(template.id)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: selectedId === template.id ? 'var(--bg-primary)' : 'transparent',
                borderLeft: selectedId === template.id ? '4px solid var(--primary-color)' : '4px solid transparent'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '4px' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {typeInfo?.label}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <span className={`badge badge-${template.status === 'active' ? 'success' : 'warning'}`} style={{ fontSize: '0.625rem' }}>
                  {template.status === 'active' ? 'Ativo' : 'Rascunho'}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
                  {template.sections.length} seções
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateList;
