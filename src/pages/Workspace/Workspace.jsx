import { useNavigate } from 'react-router-dom'
import useMockStore from '../../store/useMockStore'
import './Workspace.css'

const Workspace = () => {
  const navigate = useNavigate()
  const { user, processes, updateProcessStatus, addContestation, addProcess, selectedProcessId, setSelectedProcessId } = useMockStore()

  if (!user) {
    navigate('/login')
    return null
  }

  const userProcesses = processes.filter(p => p.ownerEmail === user.email)
  const userDemands = userProcesses.filter(p => p.status.includes('Pendente'))

  const handleNewSubmission = () => {
    const id = `BRA-2026-${Math.floor(Math.random() * 900) + 100}`
    alert(`Nova Submissão Iniciada: ${id}\n\nSimulando Etapa A (Submissão) e B (Triagem IA)...`)
    
    const newProcess = {
      id,
      name: 'Novo Método em Avaliação',
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'Em Triagem (IA)',
      role: 'Proponente',
      description: 'Método submetido recentemente para análise automatizada.',
      tasks: []
    }

    addProcess(newProcess)

    setTimeout(() => {
      updateProcessStatus(id, 'Pendente / Necessita Ajustes')
      alert(`IA concluiu a triagem para ${id}:\nStatus: Pendente / Necessita Ajustes\nScore de Prontidão: 65%`)
    }, 2000)
  }

  const handleContest = (id) => {
    const justification = prompt('Insira sua justificativa técnica para contestar a triagem da IA:')
    if (justification) {
      addContestation(id, justification)
      alert('Contestação registrada. Aguardando validação humana da Equipe BraCVAM.')
    }
  }

  const getStatusClass = (status) => {
    const s = status.toLowerCase()
    if (s.includes('triagem')) return 'status-triagem'
    if (s.includes('pendente')) return 'status-pendente'
    if (s.includes('contestado')) return 'status-contestado'
    return 'status-rascunho'
  }

  return (
    <main className="workspace-content">
      <div className="content-top-bar">
        <h2>Seus Métodos</h2>
        <button className="btn btn-primary" onClick={handleNewSubmission} style={{ height: '44px', padding: '0 24px', borderRadius: '12px' }}>
          + Nova Submissão
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="left-panel">
          <section className="processes-section">
            <h3 className="section-title">Fluxo de Validação</h3>
            <div className="process-grid">
              {userProcesses.map(p => (
                <div 
                  key={p.id} 
                  className={`modern-card process-card ${selectedProcessId === p.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProcessId(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="process-role">{p.role}</div>
                    <div className={`status-badge ${getStatusClass(p.status)}`}>
                      {p.status}
                    </div>
                  </div>
                  <h3>{p.name}</h3>
                  <p className="text-secondary text-small" style={{ flex: 1, lineBreak: 'anywhere' }}>{p.description}</p>
                  <div className="process-footer">
                    <span>ID: {p.id}</span>
                    <span>Ativo há 3 dias</span>
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
                      <h4>Ajuste solicitado por IA em: {p.id}</h4>
                      <p>Score de prontidão insuficiente (65%).</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); handleContest(p.id); }}>
                        Contestar análise da IA
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                      <a href="#" className="action-link" onClick={(e) => e.preventDefault()}>
                        Revisar documentação
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                    </div>
                  </div>
                ))}
                {userDemands.length === 0 && (
                  <div className="text-tertiary text-small" style={{ textAlign: 'center', padding: '20px' }}>
                    Nenhuma ação pendente.
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
