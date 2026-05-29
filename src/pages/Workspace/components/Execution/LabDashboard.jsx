import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'
import ExecutionStepper from './ExecutionStepper'
import SampleReceipt from './SampleReceipt'
import TrialManagement from './TrialManagement'
import FinalConsolidation from './FinalConsolidation'
import MaterialReturn from './MaterialReturn'
import IncidentWizard from './IncidentWizard'

const LabDashboard = ({ process }) => {
  const { user, transitionTo } = useMockStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [showIncidentWizard, setShowIncidentWizard] = useState(false)

  const myAssignments = (process.blindAssignments || []).filter(ba => ba.labEmail === user.email)
  const trials = (process.trialRecords || []).filter(t => t.operatorEmail === user.email || true)
  const allReceived = myAssignments.length > 0 && myAssignments.every(ba => ba.status === 'RECEIVED')
  const consolidation = process.labConsolidations?.[user.email]
  const materialsReturned = process.materialReturns?.[user.email]

  const steps = [
    { id: 'receipt', label: 'Recebimento', isCompleted: allReceived },
    { id: 'trials', label: 'Ensaios', isCompleted: trials.length >= (myAssignments.length * 3) },
    { id: 'consolidation', label: 'Consolidação', isCompleted: !!consolidation },
    { id: 'return', label: 'Devolução', isCompleted: !!materialsReturned },
    { id: 'submission', label: 'Submissão', isCompleted: false }
  ]

  const handleFinish = () => {
    if (confirm('Deseja finalizar sua participação nesta rodada e enviar os dados ao estatístico? Esta ação bloqueará novas edições.')) {
      alert('Dados enviados com sucesso! Seu laboratório concluiu a fase experimental.');
    }
  }

  return (
    <div className="lab-dashboard-v2">
      <header className="execution-header-compact">
        <div className="header-info">
          <span className="context-label">Execução Experimental</span>
          <h3>{process.name}</h3>
        </div>
        <div className="header-actions">
          <button className="btn btn-tiny btn-danger" onClick={() => setShowIncidentWizard(true)}>
            ⚠ Relatar Ocorrência
          </button>
        </div>
      </header>

      <ExecutionStepper 
        currentStep={currentStep} 
        steps={steps} 
        onStepClick={setCurrentStep} 
      />

      <main className="execution-content-area">
        {currentStep === 0 && <SampleReceipt process={process} />}
        {currentStep === 1 && (
          allReceived ? <TrialManagement process={process} /> : 
          <div className="locked-state">
            <h4>Acesso Bloqueado</h4>
            <p>Confirme o recebimento de todas as amostras para iniciar os ensaios.</p>
          </div>
        )}
        {currentStep === 2 && <FinalConsolidation process={process} />}
        {currentStep === 3 && <MaterialReturn process={process} />}
        {currentStep === 4 && (
          <div className="final-submission-check">
            <h3>Revisão Final para Envio</h3>
            <div className="checklist modern-card">
              <div className="check-item">
                <span className="check-icon">{allReceived ? '✓' : '○'}</span>
                <span>Recebimento confirmado</span>
              </div>
              <div className="check-item">
                <span className="check-icon">{trials.length > 0 ? '✓' : '○'}</span>
                <span>{trials.length} ensaios registrados</span>
              </div>
              <div className="check-item">
                <span className="check-icon">{consolidation ? '✓' : '○'}</span>
                <span>Consolidação concluída</span>
              </div>
              <div className="check-item">
                <span className="check-icon">{materialsReturned ? '✓' : '○'}</span>
                <span>Devolução de materiais registrada</span>
              </div>
            </div>
            <button 
              className="btn btn-primary btn-large" 
              style={{ marginTop: '32px', width: '100%', background: '#009c3b' }}
              onClick={handleFinish}
              disabled={!allReceived || trials.length === 0 || !consolidation || !materialsReturned}
            >
              Enviar ao Estatístico
            </button>
          </div>
        )}
      </main>

      {showIncidentWizard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <IncidentWizard process={process} onClose={() => setShowIncidentWizard(false)} />
          </div>
        </div>
      )}

      <style>{`
        .lab-dashboard-v2 { background: white; border-radius: 12px; border: 1px solid var(--border-color); min-height: 80vh; display: flex; flex-direction: column; }
        .execution-header-compact { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border-color); }
        .context-label { font-size: 10px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; }
        .execution-header-compact h3 { margin: 0; font-size: 18px; color: var(--text-primary); }
        
        .execution-content-area { flex: 1; padding: 32px; overflow-y: auto; }
        
        .locked-state { text-align: center; padding: 60px; color: var(--text-tertiary); }
        .final-submission-check { max-width: 500px; margin: 0 auto; text-align: center; }
        .checklist { margin-top: 24px; text-align: left; padding: 24px; }
        .check-item { display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .check-icon { font-weight: 800; color: #009c3b; font-size: 18px; width: 24px; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 0; border-radius: 12px; width: 500px; }
      `}</style>
    </div>
  )
}

export default LabDashboard

