import React from 'react';

const STEPS = [
  { id: 0, label: 'Informações Gerais' },
  { id: 1, label: 'Planilhas' },
  { id: 2, label: 'Colunas' },
  { id: 3, label: 'Validações' },
  { id: 4, label: 'Exportação' },
  { id: 5, label: 'Preview & Simulação' },
  { id: 6, label: 'Versão & Publicação' }
];

const ProtocolStepper = ({ activeStep, onChangeStep }) => {
  return (
    <div className="protocol-stepper">
      {STEPS.map((step, index) => (
        <div 
          key={step.id} 
          className={`step-item ${activeStep === step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
          onClick={() => onChangeStep(step.id)}
        >
          <div className="step-number">
            {activeStep > step.id ? '✓' : step.id + 1}
          </div>
          <div className="step-label">{step.label}</div>
          {index < STEPS.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
};

export default ProtocolStepper;
