import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMockStore from '../../../store/useMockStore';

const FormRenderer = ({ template }) => {
  const navigate = useNavigate();
  const { addProcess } = useMockStore();
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [showAiResult, setShowAiResult] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const currentSection = template.sections[currentSectionIdx];

  const handleNext = () => {
    if (currentSectionIdx < template.sections.length - 1) {
      setCurrentSectionIdx(currentSectionIdx + 1);
      setShowAiResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
      setShowAiResult(false);
    }
  };

  const handleValidate = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setShowAiResult(true);
    }, 1500);
  };

  const handleFinish = () => {
    const id = `BRA-2026-${Math.floor(Math.random() * 900) + 100}`;
    
    const newProcess = {
      id,
      name: `Submissão: ${template.name}`,
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'Rascunho',
      role: 'Proponente',
      description: `Método submetido via template ${template.name}`,
      submissionType: template.methodType,
      tasks: []
    };

    addProcess(newProcess);
    navigate(`/workspace/${id}`);
  };

  if (!currentSection) return <div>Template sem seções.</div>;

  return (
    <div className="form-renderer-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="progress-bar" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {template.sections.map((s, idx) => (
          <div 
            key={s.id} 
            style={{ 
              flex: 1, 
              height: '4px', 
              backgroundColor: idx <= currentSectionIdx ? 'var(--primary-color)' : 'var(--border-color)',
              borderRadius: '2px'
            }}
          />
        ))}
      </div>

      <div className="section-card builder-card">
        <div className="builder-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Etapa {currentSectionIdx + 1} de {template.sections.length}
            </span>
            <h3 style={{ margin: 0 }}>{currentSection.name}</h3>
          </div>
        </div>

        <div className="builder-card-content" style={{ minHeight: '300px' }}>
          {currentSection.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
              {currentSection.description}
            </p>
          )}

          <div className="fields-container">
            {currentSection.fields.map(field => (
              <div key={field.id} className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                  {field.label} {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea className="modern-input" rows="4" placeholder={field.placeholder}></textarea>
                ) : field.type === 'select' ? (
                  <select className="modern-input">
                    <option value="">Selecione...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="text" className="modern-input" placeholder={field.placeholder} />
                )}
                {field.helpText && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{field.helpText}</p>}
              </div>
            ))}
          </div>

          {currentSection.aiPromptConfig?.enabled && (
            <div style={{ marginTop: '32px' }}>
              <button 
                className="btn-secondary" 
                onClick={handleValidate} 
                disabled={isValidating}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59, 130, 246, 0.05)', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
              >
                {isValidating ? (
                  <>Analisando...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    Realizar Triagem IA (Sessão)
                  </>
                )}
              </button>

              {showAiResult && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--primary-color)', 
                  borderRadius: '8px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Resultado da IA
                  </div>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '0.75rem', 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'monospace',
                    color: 'var(--text-primary)'
                  }}>
                    {currentSection.aiPromptConfig.mockPreviewResponse}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="builder-card-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={handlePrevious} disabled={currentSectionIdx === 0}>Anterior</button>
          {currentSectionIdx === template.sections.length - 1 ? (
            <button className="btn-primary" onClick={handleFinish}>Finalizar Submissão</button>
          ) : (
            <button className="btn-primary" onClick={handleNext}>Próxima Etapa</button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FormRenderer;
