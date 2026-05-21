import LabDashboard from './LabDashboard'
import './Execution.css'

const ExecutionStage = ({ process }) => {
  return (
    <div className="execution-stage-container">
      <div className="execution-header">
        <div className="execution-title-group">
          <span className="stage-badge execution">Etapa D</span>
          <h3>Execução Experimental e Coleta de Dados</h3>
        </div>
        <p className="text-secondary">
          Ambiente operacional para laboratórios participantes realizarem o upload de registros e resultados experimentais.
        </p>
      </div>

      <LabDashboard process={process} />
    </div>
  )
}

export default ExecutionStage
