import { useState } from 'react'
import DemandsList from '../Planning/DemandsList'
import ConsolidatedList from '../Planning/ConsolidatedList'

const LabDashboard = ({ process }) => {
  return (
    <div className="lab-dashboard-grid">
      <div className="execution-main-column">
        <section className="execution-section">
          <div className="section-header">
            <h4 className="section-title">Fila de Execução</h4>
            <span className="count-badge">{(process.executionDemands || []).length} pendentes</span>
          </div>
          <DemandsList process={{ ...process, planningDemands: process.executionDemands }} />
        </section>
      </div>

      <aside className="execution-side-column">
        <section className="context-section">
          <div className="section-header">
            <h4 className="section-title">Protocolo de Referência</h4>
          </div>
          <div className="modern-card protocol-reference">
            <h5>{process.protocol?.version || 'v1.0'} - Aprovado</h5>
            <p className="text-smaller text-secondary">{process.protocol?.description}</p>
            <div className="protocol-meta">
              <span>{process.protocol?.updatedAt}</span>
              <button className="btn-tiny btn-secondary">Abrir Protocolo</button>
            </div>
          </div>
        </section>

        <section className="submissions-section" style={{ marginTop: '24px' }}>
          <div className="section-header">
            <h4 className="section-title">Suas Submissões</h4>
          </div>
          <ConsolidatedList consolidated={process.planningConsolidated || []} />
        </section>
      </aside>
    </div>
  )
}

export default LabDashboard
