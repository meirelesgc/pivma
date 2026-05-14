import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useMockStore from '../../store/useMockStore'
import MethodForm from './components/MethodForm'
import TriagePanel from './components/TriagePanel'
import ProcessHistory from './components/ProcessHistory'
import './Workspace.css'
import './components/components.css'

const Workspace = () => {
  const navigate = useNavigate()
  const { processId } = useParams()
  const { user, processes, addProcess, setSelectedProcessId } = useMockStore()

  useEffect(() => {
    setSelectedProcessId(processId || null)
  }, [processId, setSelectedProcessId])

  if (!user) {
    navigate('/login')
    return null
  }

  // Admin (Equipe BraCVAM) sees everything, others see their own
  const userProcesses = user.role === 'Admin' 
    ? processes 
    : processes.filter(p => p.ownerEmail === user.email)

  // Demands based on role and state
  const userDemands = processes.filter(p => {
    if (user.role === 'Admin') {
      return p.currentState === 'SUBMETIDO' || (p.currentState === 'TRIAGEM_IA' && p.iaStatus === 'Apto');
    } else {
      return (p.ownerEmail === user.email) && (p.currentState === 'PENDENTE_AJUSTE');
    }
  })

  const selectedProcess = processes.find(p => p.id === processId)

  const handleNewSubmission = () => {
    const id = `BRA-2026-${Math.floor(Math.random() * 900) + 100}`
    
    const newProcess = {
      id,
      name: 'Novo Método em Avaliação',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'Rascunho',
      role: 'Proponente',
      description: '',
      tasks: []
    }

    addProcess(newProcess)
    navigate(`/workspace/${id}`)
  }

  const getStatusClass = (status, stateId) => {
    if (stateId === 'PENDENTE_AJUSTE') return 'status-pendente'
    if (stateId === 'TRIAGEM_IA') return 'status-triagem'
    if (stateId === 'SUBMETIDO') return 'status-triagem'
    if (stateId === 'APTO' || stateId === 'PLANEJAMENTO') return 'status-contestado' // reusing color for "active/approved"
    return 'status-rascunho'
  }

  if (processId && selectedProcess) {
    return (
      <main className="workspace-content">
        <div className="content-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/workspace')}
              style={{ padding: '8px 12px', borderRadius: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div>
              <div className="text-tertiary text-small">ID: {selectedProcess.id}</div>
              <h2 style={{ margin: 0 }}>{selectedProcess.name}</h2>
            </div>
          </div>
          <div className={`status-badge ${getStatusClass(selectedProcess.status, selectedProcess.currentState)}`}>
            {selectedProcess.status}
          </div>
        </div>

        <div className="process-context-grid">
          <div className="form-column">
            <MethodForm process={selectedProcess} />
          </div>
          <div className="triage-column">
            <TriagePanel process={selectedProcess} />
          </div>
        </div>

        <div className="history-row">
          <ProcessHistory history={selectedProcess.history} />
        </div>
      </main>
    )
  }

  return (
    <main className="workspace-content">
      <div className="content-top-bar">
        <h2>Seus Métodos</h2>
        {user.role === 'Proponente' && (
          <button className="btn btn-primary" onClick={handleNewSubmission} style={{ height: '44px', padding: '0 24px', borderRadius: '12px' }}>
            + Nova Submissão
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="left-panel">
          <section className="processes-section">
            <h3 className="section-title">Fluxo de Validação</h3>
            <div className="process-grid">
              {userProcesses.map(p => (
                <div 
                  key={p.id} 
                  className="modern-card process-card"
                  onClick={() => navigate(`/workspace/${p.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="process-role">{p.role}</div>
                    <div className={`status-badge ${getStatusClass(p.status, p.currentState)}`}>
                      {p.status}
                    </div>
                  </div>
                  <h3>{p.name}</h3>
                  <p className="text-secondary text-small" style={{ flex: 1, lineBreak: 'anywhere' }}>{p.description}</p>
                  <div className="process-footer">
                    <span>ID: {p.id}</span>
                    <span>Ativado há 3 dias</span>
                  </div>
                </div>
              ))}
              {userProcesses.length === 0 && (
                <div className="modern-card" style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                  <p className="text-secondary">Você ainda não possui métodos submetidos.</p>
                  <p className="text-tertiary text-small" style={{ marginTop: '8px' }}>Clique em "Nova Submissão" para começar.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="right-panel">
          <div className="right-panel-content">
            <section className="simulation-section">
              <h3 className="section-title">Contexto do Sistema</h3>
              <div className="modern-card simulation-context">
                <h5>Visualização de {user.role}</h5>
                <p className="text-small">
                  Você está visualizando apenas os métodos em que atua como **{user.role}**. 
                  O sistema filtra automaticamente sua área de trabalho para garantir o foco nas suas responsabilidades.
                </p>
              </div>
            </section>

            <section className="demands-section">
              <h3 className="section-title">Ações Necessárias</h3>
              <div className="demand-list">
                {userDemands.map(p => (
                  <div key={p.id} className="demand-card">
                    <div className="demand-info">
                      <div className="process-role" style={{ marginBottom: '8px' }}>{p.role}</div>
                      <h4>
                        {user.role === 'Admin' 
                          ? `Validar triagem em: ${p.id}` 
                          : `Ajuste solicitado por IA em: ${p.id}`
                        }
                      </h4>
                      <p>
                        {user.role === 'Admin'
                          ? 'IA concluiu triagem com sucesso (Score > 80%).'
                          : 'Score de prontidão insuficiente (65%).'
                        }
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); navigate(`/workspace/${p.id}`); }}>
                        {user.role === 'Admin' ? 'Analisar e Aprovar' : 'Ver detalhes e contestar'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                    </div>
                  </div>
                ))}
                {userDemands.length === 0 && (
                  <div className="text-tertiary text-small" style={{ textAlign: 'center', padding: '20px' }}>
                    Nenhuma ação pendente para seu perfil.
                  </div>
                )}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Workspace
