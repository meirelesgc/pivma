import React from 'react';
import { METHOD_TYPES } from '../../../modules/formBuilder/store/mockData';

const TemplateList = ({ templates, selectedId, onSelect }) => {
  return (
    <div className="template-list">
      <div className="list-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          Selecione o Template de Submissão
        </h3>
      </div>
      <div className="list-items-horizontal" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '0',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        {templates.map(template => {
          const typeInfo = METHOD_TYPES[template.methodType];
          const isActive = selectedId === template.id;
          
          return (
            <div 
              key={template.id}
              className={`template-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(template.id)}
              style={{
                padding: '20px 24px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)',
                backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                boxShadow: isActive ? 'inset 0 4px 0 var(--primary-color)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '4px', color: isActive ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
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
