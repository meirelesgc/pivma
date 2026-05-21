import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'

const MacroSchedule = ({ process, demand, onComplete }) => {
  const { addMilestone, consolidateDemand, saveDemandDraft } = useMockStore()
  
  const [milestones, setMilestones] = useState(demand.consolidationData || [
    { title: 'Distribuição de amostras', description: 'Envio das substâncias codificadas para os laboratórios.', targetDate: '', isGate: true, status: 'pending' },
    { title: 'Execução experimental', description: 'Realização dos ensaios nos laboratórios participantes.', targetDate: '', isGate: true, status: 'pending' },
    { title: 'Submissão de resultados', description: 'Upload dos dados brutos e resultados na plataforma.', targetDate: '', isGate: true, status: 'pending' }
  ])

  const handleUpdateMilestone = (index, field, value) => {
    const newMilestones = [...milestones]
    newMilestones[index][field] = value
    setMilestones(newMilestones)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Add all milestones to the store
    milestones.forEach(m => {
      addMilestone(process.id, {
        ...m,
        phase: 'PLANEJAMENTO',
      })
    })

    // Complete the demand via consolidation
    consolidateDemand(process.id, demand.id)

    if (onComplete) onComplete()
  }

  const handleSaveDraft = () => {
    saveDemandDraft(process.id, demand.id, milestones)
    alert('Rascunho do cronograma salvo!')
  }

  return (
    <form className="planning-form" onSubmit={handleSubmit}>
      <div className="milestones-setup">
        <p className="text-smaller text-tertiary" style={{ marginBottom: '16px' }}>
          Defina os prazos previstos para os marcos obrigatórios da OECD (GD34).
        </p>

        {milestones.map((m, index) => (
          <div key={index} className="milestone-form-row" style={{ 
            padding: '12px', 
            background: 'rgba(0,0,0,0.02)', 
            borderRadius: '8px', 
            marginBottom: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{m.title}</span>
              {m.isGate && <span className="stage-badge" style={{ background: '#ff4d4f', fontSize: '8px' }}>Gate Obrigatório</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prazo Previsto</label>
                <input 
                  type="date" 
                  value={m.targetDate} 
                  onChange={(e) => handleUpdateMilestone(index, 'targetDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input 
                  type="text" 
                  value={m.description} 
                  onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                  className="text-smaller"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="action-link" onClick={handleSaveDraft}>
          Salvar Rascunho
        </button>
        <button type="submit" className="btn btn-primary">
          Confirmar e Consolidar Cronograma
        </button>
      </div>
    </form>
  )
}

export default MacroSchedule
