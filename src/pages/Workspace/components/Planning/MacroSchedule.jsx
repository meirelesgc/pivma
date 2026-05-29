import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'

const MacroSchedule = ({ process, demand, onComplete }) => {
  const { addMilestone, consolidateDemand, saveDemandDraft } = useMockStore()
  
  const [milestones, setMilestones] = useState(demand.consolidationData || [
    { title: 'Distribuição de amostras', description: 'Envio das substâncias codificadas.', targetDate: '', isGate: true, status: 'pending' },
    { title: 'Execução experimental', description: 'Realização dos ensaios laboratoriais.', targetDate: '', isGate: true, status: 'pending' },
    { title: 'Submissão de resultados', description: 'Upload dos dados brutos na plataforma.', targetDate: '', isGate: true, status: 'pending' },
    { title: 'Relatório Consolidado', description: 'Emissão do relatório interlaboratorial.', targetDate: '', isGate: false, status: 'pending' }
  ])

  const handleUpdateMilestone = (index, field, value) => {
    const newMilestones = [...milestones]
    newMilestones[index][field] = value
    setMilestones(newMilestones)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (milestones.some(m => m.isGate && !m.targetDate)) {
      alert('Por favor, defina datas para todos os marcos obrigatórios.')
      return
    }
    milestones.forEach(m => addMilestone(process.id, { ...m, phase: 'PLANEJAMENTO' }))
    consolidateDemand(process.id, demand.id)
    if (onComplete) onComplete()
  }

  const handleSaveDraft = () => {
    saveDemandDraft(process.id, demand.id, milestones)
    alert('Rascunho do cronograma salvo!')
  }

  return (
    <div className="timeline-setup-workspace">
      <div className="workspace-intro">
        <p className="text-secondary">Defina o cronograma macro do estudo. Marcos obrigatórios (gates) são essenciais para o compliance regulatório.</p>
      </div>

      <div className="visual-timeline-container">
        {milestones.map((m, index) => (
          <div key={index} className={`timeline-step-card ${m.isGate ? 'is-gate' : ''}`}>
            <div className="step-indicator">
              <div className="step-number">{index + 1}</div>
              <div className="step-line"></div>
            </div>
            
            <div className="step-content-card">
              <div className="step-header">
                <div className="step-title-group">
                  <span className="step-title">{m.title}</span>
                  {m.isGate && <span className="gate-badge">Gargalo Crítico</span>}
                </div>
                <input 
                  type="date" 
                  className="step-date-input"
                  value={m.targetDate} 
                  onChange={(e) => handleUpdateMilestone(index, 'targetDate', e.target.value)}
                  required={m.isGate}
                />
              </div>
              <p className="step-description">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="workspace-footer">
        <div className="footer-summary">
          <span className="text-small"><strong>{milestones.filter(m => m.targetDate).length} / {milestones.length}</strong> datas definidas</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-ghost" onClick={handleSaveDraft}>Salvar Rascunho</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Confirmar Cronograma</button>
        </div>
      </div>

      <style>{`
        .timeline-setup-workspace { display: flex; flex-direction: column; gap: 32px; }
        .visual-timeline-container { display: flex; flex-direction: column; gap: 0; }
        
        .timeline-step-card { display: flex; gap: 24px; }
        .step-indicator { display: flex; flex-direction: column; align-items: center; width: 32px; }
        .step-number { 
          width: 32px; height: 32px; border-radius: 50%; background: white; 
          border: 2px solid var(--border-color); display: flex; align-items: center; 
          justify-content: center; font-weight: 700; color: var(--text-tertiary); z-index: 1;
        }
        .timeline-step-card.is-gate .step-number { border-color: #ff4d4f; color: #ff4d4f; }
        .step-line { width: 2px; flex: 1; background: #e0e0e0; margin: 4px 0; }
        .timeline-step-card:last-child .step-line { display: none; }

        .step-content-card { 
          flex: 1; padding: 20px; background: white; border: 1px solid var(--border-color); 
          border-radius: 12px; margin-bottom: 24px; transition: all 0.2s;
        }
        .timeline-step-card.is-gate .step-content-card { border-left: 4px solid #ff4d4f; }
        .step-content-card:hover { border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .step-title { font-weight: 600; font-size: 16px; color: var(--text-primary); }
        .gate-badge { 
          font-size: 8px; text-transform: uppercase; background: #fff1f0; 
          color: #cf1322; border: 1px solid #ffa39e; padding: 2px 6px; 
          border-radius: 4px; font-weight: 700; margin-left: 8px;
        }
        .step-date-input { 
          padding: 8px 12px; border: 1px solid var(--border-color); 
          border-radius: 6px; font-size: 13px; outline: none;
        }
        .step-date-input:focus { border-color: var(--primary-color); }
        .step-description { font-size: 13px; color: var(--text-secondary); margin: 0; }
      `}</style>
    </div>
  )
}

export default MacroSchedule
