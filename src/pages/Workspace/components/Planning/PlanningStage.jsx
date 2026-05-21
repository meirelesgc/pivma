import DemandsList from './DemandsList'
import ConsolidatedList from './ConsolidatedList'
import './Planning.css'

const PlanningStage = ({ process }) => {
  return (
    <div className="planning-stage-container">
      <div className="planning-header">
        <div className="planning-title-group">
          <span className="stage-badge">Etapa C</span>
          <h3>Planejamento e Preparação Institucional</h3>
        </div>
        <p className="text-secondary">
          Configure a governança, equipe técnica e o cronograma macro do estudo de validação.
        </p>
      </div>

      <div className="planning-grid">
        <section className="demands-section">
          <div className="section-header">
            <h4 className="section-title">Bloco 1 — Demandas Operacionais</h4>
            <span className="count-badge">{(process.planningDemands || []).length} pendentes</span>
          </div>
          <DemandsList process={process} />
        </section>

        <section className="consolidated-section">
          <div className="section-header">
            <h4 className="section-title">Bloco 2 — Consolidado (Trilha)</h4>
          </div>
          <ConsolidatedList consolidated={process.planningConsolidated || []} />
        </section>
      </div>
    </div>
  )
}

export default PlanningStage
