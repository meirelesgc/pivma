import React from 'react';

const AiPromptEditor = ({ section, onUpdate }) => {
  const config = section.aiPromptConfig || { enabled: false, prompt: '', responseSchema: [] };

  const handleToggle = () => {
    onUpdate({ enabled: !config.enabled });
  };

  const handlePromptChange = (e) => {
    onUpdate({ prompt: e.target.value });
  };

  return (
    <div className="ai-prompt-editor" style={{ 
      border: '1px solid var(--border-color)', 
      borderRadius: '8px', 
      overflow: 'hidden',
      backgroundColor: config.enabled ? 'rgba(59, 130, 246, 0.03)' : 'var(--bg-primary)'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: config.enabled ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: config.enabled ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Validação por Inteligência Artificial</span>
        </div>
        <div className="toggle-switch">
          <input 
            type="checkbox" 
            id={`ai-toggle-${section.id}`} 
            checked={config.enabled} 
            onChange={handleToggle}
          />
          <label htmlFor={`ai-toggle-${section.id}`} style={{ 
            width: '40px', 
            height: '20px', 
            backgroundColor: config.enabled ? 'var(--primary-color)' : '#ccc',
            borderRadius: '10px',
            display: 'block',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <span style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'white', 
              borderRadius: '50%', 
              position: 'absolute',
              top: '2px',
              left: config.enabled ? '22px' : '2px',
              transition: 'left 0.2s'
            }}></span>
          </label>
        </div>
      </div>

      {config.enabled && (
        <div style={{ padding: '16px' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
              Prompt de Validação Institucional
            </label>
            <textarea 
              className="modern-input" 
              rows="4" 
              placeholder="Descreva as instruções para a IA analisar esta sessão..."
              value={config.prompt}
              onChange={handlePromptChange}
              style={{ fontSize: '0.875rem' }}
            ></textarea>
          </div>

          <div className="schema-editor">
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
              Schema de Resposta Estruturada
            </label>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0' }}>Campo</th>
                  <th style={{ padding: '8px 0' }}>Tipo</th>
                  <th style={{ padding: '8px 0' }}>Obrigatório</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(config.responseSchema || []).map((field, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 0' }}>{field.label}</td>
                    <td style={{ padding: '8px 0' }}>{field.type}</td>
                    <td style={{ padding: '8px 0' }}>{field.isRequired ? 'Sim' : 'Não'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-tiny" style={{ color: '#ef4444' }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-secondary btn-tiny" style={{ marginTop: '12px' }}>+ Adicionar Campo ao Schema</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPromptEditor;
