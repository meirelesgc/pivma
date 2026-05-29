import { useState, useMemo } from 'react'
import DemandsList from './DemandsList'
import ConsolidatedList from './ConsolidatedList'
import './Planning.css'

const PlanningStage = ({ process }) => {
  const [activeDemandId, setActiveDemandId] = useState(process.planningDemands?.[0]?.id || null)

  const activeDemand = useMemo(() => {
    return (process.planningDemands || []).find(d => d.id === activeDemandId)
  }, [process.planningDemands, activeDemandId])

  const progress = useMemo(() => {
    const total = (process.planningDemands || []).length + (process.planningConsolidated || []).length
    const done = (process.planningConsolidated || []).length
    return total > 0 ? Math.round((done / total) * 100) : 100
  }, [process.planningDemands, process.planningConsolidated])

  return (
    <div className="planning-workspace-layout-2col">
      {/* Top: Task Navigation Horizontal List */}
      <header className="planning-top-nav">
        <div className="nav-header">
          <div className="title-group">
            <span className="stage-badge">Etapa C</span>
            <h4>Tarefas Operacionais</h4>
          </div>
          <div className="progress-summary">
            <span className="text-smaller text-tertiary">Prontidão: <strong>{progress}%</strong></span>
            <div className="mini-gauge-bg">
              <div className="mini-gauge-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        <DemandsList 
          process={process} 
          activeDemandId={activeDemandId} 
          onSelectDemand={setActiveDemandId}
          horizontal={true}
        />
      </header>

      <div className="planning-columns-container">
        {/* Left: Active Task Workspace */}
        <main className="planning-main-content">
          {activeDemand ? (
            <div className="active-task-container">
              <header className="task-workspace-header">
                <div className="header-info">
                  <span className="task-type-tag">{activeDemand.type.replace('-', ' ')}</span>
                  <h2>{activeDemand.title}</h2>
                  <p className="text-secondary">{activeDemand.description}</p>
                </div>
                <div className="header-meta">
                  <span className="due-date">Prazo: {new Date(activeDemand.dueDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </header>

              <div className="task-inner-workspace">
                <DemandsList.Renderer demand={activeDemand} process={process} onComplete={() => setActiveDemandId(null)} />
              </div>
            </div>
          ) : (
            <div className="empty-workspace-state">
              <div className="empty-icon">✓</div>
              <h3>Todas as demandas operacionais foram consolidadas</h3>
              <p className="text-secondary">O processo está pronto para seguir para a próxima macroetapa.</p>
            </div>
          )}
        </main>

        {/* Right: History & Context Panel */}
        <aside className="planning-context-panel">
          <section className="context-section consolidated-history">
            <div className="section-header">
              <h4>Itens Consolidados</h4>
              <span className="count-badge">{(process.planningConsolidated || []).length}</span>
            </div>
            <ConsolidatedList consolidated={process.planningConsolidated || []} />
          </section>

          <section className="context-section study-meta">
            <h4>Resumo do Estudo</h4>
            <div className="meta-item">
              <span className="label">Identificador</span>
              <span className="value">{process.id}</span>
            </div>
            <div className="meta-item">
              <span className="label">Área</span>
              <span className="value">{process.scientificArea}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default PlanningStage
