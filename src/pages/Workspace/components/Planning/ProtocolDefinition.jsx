import React, { useEffect } from 'react';
import useProtocolDefinitionStore from '../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import useMockStore from '../../../../store/useMockStore';
import ProtocolStepper from './ProtocolDefinition/ProtocolStepper';
import GeneralInfoStep from './ProtocolDefinition/GeneralInfoStep';
import SpreadsheetConfigStep from './ProtocolDefinition/SpreadsheetConfigStep';
import SheetEditor from './ProtocolDefinition/SheetEditor';
import ValidationRulesStep from './ProtocolDefinition/ValidationRulesStep';
import ExportSettingsStep from './ProtocolDefinition/ExportSettingsStep';
import TemplatePreview from './ProtocolDefinition/TemplatePreview';
import TemplateImportValidator from './ProtocolDefinition/TemplateImportValidator';
import VersioningPanel from './ProtocolDefinition/VersioningPanel';
import './ProtocolDefinition/ProtocolDefinition.css';

const ProtocolDefinition = ({ process, demand, onComplete }) => {
  const {
    activeStep,
    setActiveStep,
    protocol,
    sheets,
    loadProtocol,
    resetStore
  } = useProtocolDefinitionStore();

  const { consolidateDemand } = useMockStore();

  useEffect(() => {
    // Hydrate store with existing protocol if available
    if (process?.protocol && process.protocol.sheets) {
      loadProtocol(process.protocol);
    } else {
      resetStore();
    }
  }, [process.id]);

  const handleNext = () => {
    if (activeStep < 6) {
      setActiveStep(activeStep + 1);
    } else {
      // Finalize
      const finalProtocol = { protocol, sheets };
      consolidateDemand(process.id, demand.id, finalProtocol);
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0: return <GeneralInfoStep />;
      case 1: return <SpreadsheetConfigStep />;
      case 2: return <SheetEditor />;
      case 3: return <ValidationRulesStep />;
      case 4: return <ExportSettingsStep />;
      case 5: return (
        <>
          <TemplatePreview />
          <TemplateImportValidator />
        </>
      );
      case 6: return <VersioningPanel />;
      default: return <GeneralInfoStep />;
    }
  };

  return (
    <div className="protocol-definition-container">
      <div className="protocol-header">
        <div>
          <h2>Definir Protocolo Padronizado</h2>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {process.id} • {process.name}
          </span>
        </div>
        <div className="badge-type" style={{ padding: '8px 16px', background: '#f0f0f0', fontWeight: 'bold' }}>
          VERSÃO {protocol.version || '1.0'}
        </div>
      </div>

      <ProtocolStepper activeStep={activeStep} onChangeStep={setActiveStep} />

      <div className="protocol-content">
        {renderStep()}
      </div>

      <div className="protocol-footer">
        <button
          className="btn-secondary"
          onClick={handleBack}
          disabled={activeStep === 0}
          style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: 'white' }}
        >
          Voltar
        </button>
        <button
          className="btn-primary"
          onClick={handleNext}
          style={{ padding: '10px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {activeStep === 6 ? 'Finalizar e Consolidar' : 'Próximo Passo'}
        </button>
      </div>
    </div>
  );
};

export default ProtocolDefinition;
