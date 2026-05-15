import React from 'react';
import { METHOD_TYPES } from '../../../modules/formBuilder/store/mockData';

const TemplateList = ({ templates, selectedId, onSelect }) => {
  return (
    <div className="template-list">
      <div className="list-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          Templates
        </h3>
      </div>
      <div className="list-items">
        {templates.map(template => {
          const typeInfo = METHOD_TYPES[template.methodType];
          const isActive = selectedId === template.id;
          
          return (
            <div 
              key={template.id}
              className={`template-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(template.id)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px', color: isActive ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {typeInfo?.label}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-tiny badge-${template.status === 'active' ? 'success' : 'warning'}`}>
                  {template.status === 'active' ? 'Ativo' : 'Rascunho'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
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
