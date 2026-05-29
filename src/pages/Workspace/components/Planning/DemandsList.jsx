import RoleAssignment from './RoleAssignment'
import MacroSchedule from './MacroSchedule'
import SampleCodingModule from './SampleCodingModule'

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
  switch (demand.type) {
    case 'role-assignment':
      return <RoleAssignment process={process} demand={demand} onComplete={onComplete} />
    case 'macro-schedule':
      return <MacroSchedule process={process} demand={demand} onComplete={onComplete} />
    case 'experimental-submission':
      return (
        <div className="empty-workspace-state">
          <h3>Fluxo Experimental Estruturado</h3>
          <p className="text-secondary">
            Esta demanda agora é processada através do novo <strong>Módulo de Execução Experimental</strong>. 
            Utilize o dashboard principal de execução para realizar os registros.
          </p>
        </div>
      )
    case 'sample-coding':
      return <SampleCodingModule process={process} demand={demand} onComplete={onComplete} />
    default:
      return (
        <div className="empty-workspace-state">
          <h3>Tipo de demanda não suportado</h3>
          <p className="text-secondary">O componente para {demand.type} ainda não foi implementado.</p>
        </div>
      )
  }
}

export default DemandsList
