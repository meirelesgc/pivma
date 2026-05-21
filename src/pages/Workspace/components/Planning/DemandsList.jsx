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
          className={`demand-item ${openDemandId === demand.id ? 'open' : ''}`}
        >
          <div className="demand-summary" onClick={() => toggleDemand(demand.id)}>
            <div className="demand-info">
              <div className="demand-status-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="demand-title">{demand.title}</span>
            </div>
            <div className="demand-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          
          {openDemandId === demand.id && (
            <div className="demand-content">
              {renderDemandContent(demand)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default DemandsList
