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
    <div className="form-renderer-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* 1. Header & Stepper */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>{template.name}</h2>
        <div className="progressive-stepper" style={{ display: 'flex', gap: '4px' }}>
          {template.sections.map((s, idx) => {
            const isCompleted = idx < currentSectionIdx;
            const isCurrent = idx === currentSectionIdx;
            
            return (
              <div 
                key={s.id} 
                style={{ 
                  flex: 1, 
                  height: '6px', 
                  backgroundColor: isCurrent || isCompleted ? 'var(--primary-color)' : 'var(--border-color)',
                  borderRadius: '3px',
                  transition: 'all 0.4s ease',
                  opacity: isCurrent ? 1 : (isCompleted ? 0.6 : 0.3)
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Seção {currentSectionIdx + 1} de {template.sections.length}: {currentSection.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {Math.round(((currentSectionIdx + 1) / template.sections.length) * 100)}% concluído
          </span>
        </div>
      </div>

      {/* 2. Focused Section Card */}
      <div className="section-card builder-card" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '20px' }}>
        <div className="builder-card-content" style={{ padding: '48px' }}>
          {currentSection.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.6' }}>
              {currentSection.description}
            </p>
          )}

          <div className="fields-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {currentSection.fields.map(field => (
              <div key={field.id} className="form-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>
                  {field.label} {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea 
                    className="modern-input" 
                    rows="6" 
                    placeholder={field.placeholder || 'Digite aqui sua resposta detalhada...'}
                    style={{ fontSize: '1rem', padding: '16px', lineHeight: '1.6' }}
                  ></textarea>
                ) : field.type === 'select' ? (
                  <select className="modern-input" style={{ fontSize: '1rem', height: '52px' }}>
                    <option value="">Selecione uma opção...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder={field.placeholder || 'Sua resposta...'} 
                    style={{ fontSize: '1rem', height: '52px' }}
                  />
                )}
                {field.helpText && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>{field.helpText}</p>}
              </div>
            ))}
          </div>

          {/* AI Assistance in the Flow */}
          {currentSection.aiPromptConfig?.enabled && (
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-color)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block' }}>Triagem Automática Prévia</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verifique se sua resposta atende aos critérios institucionais</span>
                  </div>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={handleValidate} 
                  disabled={isValidating}
                  style={{ height: '40px', borderRadius: '10px' }}
                >
                  {isValidating ? 'Analisando...' : 'Validar agora'}
                </button>
              </div>

              {showAiResult && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '24px', 
                  backgroundColor: 'rgba(59, 130, 246, 0.03)', 
                  border: '1px solid rgba(59, 130, 246, 0.2)', 
                  borderRadius: '12px',
                  animation: 'slideUp 0.4s ease-out'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Análise da IA PiVMA
                  </div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {currentSection.aiPromptConfig.mockPreviewResponse}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Navigation Actions */}
        <div style={{ 
          padding: '24px 48px', 
          backgroundColor: 'rgba(0,0,0,0.02)', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button 
            className="btn-secondary" 
            onClick={handlePrevious} 
            disabled={currentSectionIdx === 0}
            style={{ padding: '12px 24px', borderRadius: '10px' }}
          >
            Voltar
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentSectionIdx === template.sections.length - 1 ? (
              <button className="btn-primary" onClick={handleFinish} style={{ padding: '12px 32px', borderRadius: '10px', fontWeight: 700 }}>
                Finalizar e Submeter
              </button>
            ) : (
              <button className="btn-primary" onClick={handleNext} style={{ padding: '12px 32px', borderRadius: '10px', fontWeight: 700 }}>
                Próxima Etapa
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FormRenderer;
