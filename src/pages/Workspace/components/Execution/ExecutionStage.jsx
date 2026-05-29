import React, { useMemo } from 'react'
import useMockStore from '../../../../store/useMockStore'
import LabDashboard from './LabDashboard'
import './Execution.css'

// Placeholder for other dashboards
const ComingSoonDashboard = ({ roleName }) => (
  <div className="empty-workspace-state modern-card" style={{ margin: '40px auto', maxWidth: '600px' }}>
    <div className="empty-icon" style={{ background: '#f0f7ff', color: '#0056b3' }}>⚙️</div>
    <h3>Módulo {roleName}</h3>
    <p className="text-secondary">
      O painel especializado para o papel de <strong>{roleName}</strong> está em desenvolvimento. 
      Em breve você poderá gerenciar suas atribuições específicas nesta etapa.
    </p>
  </div>
);

const EXECUTION_DASHBOARDS = {
  'LABORATORIO_PARTICIPANTE': LabDashboard,
  'LABORATORIO_LIDER': (props) => <ComingSoonDashboard {...props} roleName="Laboratório Líder" />,
  'COORDENADOR': (props) => <ComingSoonDashboard {...props} roleName="Coordenador do Grupo Gestor" />,
  'GESTOR_AMOSTRAS': (props) => <ComingSoonDashboard {...props} roleName="Gestor de Amostras" />,
  'ESTATISTICO': (props) => <ComingSoonDashboard {...props} roleName="Estatístico" />,
}

const ExecutionStage = ({ process }) => {
  const { user } = useMockStore();

  const userRoleInProcess = useMemo(() => {
    const participant = (process.participants || []).find(p => p.email === user.email);
    return participant?.role || 'VIEWER';
  }, [process.participants, user.email]);

  const DashboardComponent = EXECUTION_DASHBOARDS[userRoleInProcess] || (() => (
    <div className="empty-workspace-state modern-card">
      <div className="empty-icon">👁️</div>
      <h3>Modo de Visualização</h3>
      <p className="text-secondary">Você não possui um papel operacional designado nesta etapa da execução.</p>
    </div>
  ));

  return (
    <div className="execution-stage-container">
      <div className="execution-header">
        <div className="execution-title-group">
          <span className="stage-badge execution">Etapa D</span>
          <h3>Execução Experimental e Coleta de Dados</h3>
        </div>
        <p className="text-secondary">
          Ambiente modular de execução. O painel abaixo é adaptado ao seu papel no processo.
        </p>
      </div>

      <DashboardComponent process={process} />
    </div>
  )
}

export default ExecutionStage
