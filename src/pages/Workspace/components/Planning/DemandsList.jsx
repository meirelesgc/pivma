import { useState } from 'react'
import RoleAssignment from './RoleAssignment'
import MacroSchedule from './MacroSchedule'

const DemandsList = ({ process }) => {
  const [openDemandId, setOpenDemandId] = useState(null)

  const toggleDemand = (id) => {
    setOpenDemandId(openDemandId === id ? null : id)
  }

  const renderDemandContent = (demand) => {
    switch (demand.type) {
      case 'role-assignment':
        return <RoleAssignment process={process} demand={demand} onComplete={() => setOpenDemandId(null)} />
      case 'macro-schedule':
        return <MacroSchedule process={process} demand={demand} onComplete={() => setOpenDemandId(null)} />
      default:
        return <p className="text-tertiary">Tipo de demanda não suportado.</p>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return <span className="badge-status in-progress">Em preenchimento</span>
      case 'IN_VALIDATION': return <span className="badge-status validation">Aguardando Validação</span>
      default: return null
    }
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (!process.planningDemands || process.planningDemands.length === 0) {
    return (
      <div className="modern-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-tertiary text-small">Nenhuma demanda operacional pendente.</p>
      </div>
    )
  }

  return (
    <div className="demands-list">
      {process.planningDemands.map((demand) => (
        <div 
          key={demand.id} 
          className={`demand-item ${openDemandId === demand.id ? 'open' : ''} ${isOverdue(demand.dueDate) ? 'overdue' : ''}`}
        >
          <div className="demand-summary" onClick={() => toggleDemand(demand.id)}>
            <div className="demand-info" style={{ flex: 1 }}>
              <div className={`demand-status-icon ${demand.status === 'IN_PROGRESS' ? 'active' : ''}`}>
                {demand.status === 'IN_PROGRESS' ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="demand-title">{demand.title}</span>
                  {getStatusBadge(demand.status)}
                </div>
                <div className="text-smaller text-tertiary" style={{ display: 'flex', gap: '12px' }}>
                  <span>Responsável: <strong>{demand.targetName}</strong></span>
                  {demand.dueDate && (
                    <span className={isOverdue(demand.dueDate) ? 'text-danger' : ''}>
                      Prazo: {new Date(demand.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="demand-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          
          {openDemandId === demand.id && (
            <div className="demand-content">
              <p className="text-small text-secondary" style={{ marginBottom: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '12px' }}>
                {demand.description}
              </p>
              {renderDemandContent(demand)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default DemandsList
