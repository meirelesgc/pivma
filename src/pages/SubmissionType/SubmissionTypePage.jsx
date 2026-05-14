import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { METHOD_TYPES } from '../../modules/formBuilder/store/mockData';
import useFormBuilderStore from '../../modules/formBuilder/store/formBuilderStore';
import FormRenderer from '../FormBuilder/components/FormRenderer';
import './SubmissionTypePage.css';

const SubmissionTypePage = () => {
  const navigate = useNavigate();
  const { templates } = useFormBuilderStore();
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState('selection'); // selection, form

  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
  };

  const handleConfirm = () => {
    if (selectedType) {
      setStep('form');
    }
  };

  const selectedTemplate = templates.find(t => t.methodType === selectedType);

  if (step === 'form' && selectedTemplate) {
    return (
      <div className="submission-flow">
        <div className="flow-header">
          <button className="btn-tiny" onClick={() => setStep('selection')}>← Voltar para seleção</button>
          <h2>Nova Submissão: {METHOD_TYPES[selectedType].label}</h2>
        </div>
        <div className="flow-content">
          <FormRenderer template={selectedTemplate} />
        </div>
      </div>
    );
  }

  return (
    <div className="submission-type-page">
      <div className="selection-header">
        <h1>Iniciar Nova Submissão</h1>
        <p>Selecione o tipo de método que melhor descreve sua proposta para carregar o formulário adequado.</p>
      </div>

      <div className="type-grid">
        {Object.values(METHOD_TYPES).map((type) => (
          <div 
            key={type.id} 
            className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            onClick={() => handleSelectType(type.id)}
          >
            <div className="card-icon">
              {type.id === 'NEW_PENDING' && '🧪'}
              {type.id === 'VALIDATED_NEW_APP' && '🔄'}
              {type.id === 'VALIDATED_NEW_SYSTEM' && '🧫'}
              {type.id === 'NEW_COMPLETE' && '📚'}
              {type.id === 'IDEA' && '💡'}
            </div>
            <h3>{type.label}</h3>
            <p>{type.description}</p>
          </div>
        ))}
      </div>

      <div className="selection-footer">
        <button 
          className="btn-primary btn-large" 
          disabled={!selectedType}
          onClick={handleConfirm}
        >
          Confirmar e Continuar
        </button>
      </div>
    </div>
  );
};

export default SubmissionTypePage;
