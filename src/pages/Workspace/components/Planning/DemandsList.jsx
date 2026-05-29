import RoleAssignment from './RoleAssignment'
import MacroSchedule from './MacroSchedule'
import SampleCodingModule from './SampleCodingModule'
import ProtocolDefinition from './ProtocolDefinition'

// Registry of demand components for modularity
const DEMAND_COMPONENTS = {
  'role-assignment': RoleAssignment,
  'macro-schedule': MacroSchedule,
  'sample-coding': SampleCodingModule,
  'protocol-definition': ProtocolDefinition
}

const DemandsList = ({ process, activeDemandId, onSelectDemand, horizontal = false }) => {
  if (!process.planningDemands || process.planningDemands.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p className="text-tertiary text-small">Nenhuma tarefa pendente.</p>
      </div>
    )
  }

  const listClass = horizontal ? 'task-nav-list-horizontal' : 'task-nav-list'
  const itemClass = horizontal ? 'task-nav-item-h' : 'task-nav-item'

  return (
    <div className={listClass}>
      {process.planningDemands.map((demand) => (
        <div 
          key={demand.id} 
          className={`${itemClass} ${activeDemandId === demand.id ? 'active' : ''}`}
          onClick={() => onSelectDemand(demand.id)}
        >
          <div className="status-indicator">
            {demand.status === 'IN_PROGRESS' ? (
              <div className="pulse-dot"></div>
            ) : (
              <div className="pending-dot"></div>
            )}
          </div>
          <div className="task-info-mini">
            <span className="task-nav-title">{demand.title}</span>
            <div className="task-nav-meta">
              <span>{demand.targetName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Sub-component to render the specific form based on demand type
DemandsList.Renderer = ({ demand, process, onComplete }) => {
  const Component = DEMAND_COMPONENTS[demand.type]

  if (Component) {
    return <Component process={process} demand={demand} onComplete={onComplete} />
  }

  // Handle specialized redirections or unimplemented types
  if (demand.type === 'experimental-submission') {
    return (
      <div className="empty-workspace-state">
        <div className="empty-icon" style={{ background: '#fff7e6', color: '#fa8c16' }}>🔬</div>
        <h3>Módulo de Execução Direta</h3>
        <p className="text-secondary">
          Esta demanda é processada através do <strong>Dashboard de Execução Experimental</strong>. 
          Por favor, utilize o fluxo de trabalho principal da Etapa D.
        </p>
      </div>
    )
  }

  return (
    <div className="empty-workspace-state">
      <div className="empty-icon">⚠️</div>
      <h3>Tipo de demanda não suportado</h3>
      <p className="text-secondary">O componente para <strong>{demand.type}</strong> ainda não foi mapeado no sistema.</p>
    </div>
  )
}

export default DemandsList
