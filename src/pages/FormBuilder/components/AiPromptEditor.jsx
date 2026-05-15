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
      borderRadius: '12px', 
      overflow: 'hidden',
      backgroundColor: config.enabled ? 'rgba(59, 130, 246, 0.02)' : 'var(--bg-primary)',
      transition: 'all 0.3s'
    }}>
      <div style={{ 
        padding: '16px 20px', 
        backgroundColor: config.enabled ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: config.enabled ? '1px solid rgba(59, 130, 246, 0.1)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: config.enabled ? 'var(--primary-color)' : 'var(--bg-secondary)', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: config.enabled ? 'white' : 'var(--text-secondary)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block' }}>Validação Inteligente (IA)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configure critérios de análise automática para esta seção</span>
          </div>
        </div>
        <div className="toggle-switch">
          <input 
            type="checkbox" 
            id={`ai-toggle-${section.id}`} 
            checked={config.enabled} 
            onChange={handleToggle}
            style={{ display: 'none' }}
          />
          <label htmlFor={`ai-toggle-${section.id}`} style={{ 
            width: '44px', 
            height: '24px', 
            backgroundColor: config.enabled ? 'var(--primary-color)' : 'var(--border-color)',
            borderRadius: '12px',
            display: 'block',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}>
            <span style={{ 
              width: '18px', 
              height: '18px', 
              backgroundColor: 'white', 
              borderRadius: '50%', 
              position: 'absolute',
              top: '3px',
              left: config.enabled ? '23px' : '3px',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}></span>
          </label>
        </div>
      </div>

      {config.enabled && (
        <div style={{ padding: '24px' }}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', display: 'block' }}>
              Instruções de Análise (Prompt)
            </label>
            <textarea 
              className="modern-input" 
              rows="5" 
              placeholder="Descreva detalhadamente o que a IA deve procurar nas respostas desta seção..."
              value={config.prompt}
              onChange={handlePromptChange}
              style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}
            ></textarea>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Dica: Seja específico sobre critérios de aceitação e terminologias técnicas.
            </p>
          </div>

          <div className="schema-editor" style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                Estrutura de Retorno (Schema)
              </label>
              <button className="btn-secondary btn-tiny">+ Adicionar Campo</button>
            </div>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Campo</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tipo</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Obrigatório</th>
                    <th style={{ padding: '12px 16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(config.responseSchema || []).map((field, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{field.label}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{field.type}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{field.isRequired ? '✅' : '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button className="btn-tiny" style={{ color: '#ef4444', backgroundColor: 'transparent' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPromptEditor;
