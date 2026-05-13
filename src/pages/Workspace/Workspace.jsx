import { useNavigate } from 'react-router-dom'
import useMockStore from '../../store/useMockStore'
import './Workspace.css'

const Workspace = ({ isLight, onThemeToggle }) => {
  const navigate = useNavigate()
  const { user, processes, logout, updateProcessStatus, addContestation, addProcess } = useMockStore()

  if (!user) {
    navigate('/login')
    return null
  }

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
    <div className="workspace-layout">
      {/* Sidebar Modernizada */}
      <aside className="workspace-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" />
          <span>PiVMA</span>
        </div>

        <nav style={{ flex: 1 }}>
          <div className="nav-section-label">Plataforma</div>
          <div className="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Processos
          </div>
          <div className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Documentos
          </div>
          <div className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Equipes
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="user-info">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div>
              <div className="text-small weight-regular">{user.name}</div>
              <div className="text-tertiary" style={{ fontSize: '11px' }}>{user.email}</div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', height: '36px', borderRadius: '10px' }} onClick={() => {
            logout()
            navigate('/')
          }}>
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="workspace-main">
        <header className="workspace-header">
          <h1>Área de Trabalho</h1>
          
          <div className="header-controls">
            <button className="theme-toggle-btn" onClick={onThemeToggle}>
              {isLight ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
            <button className="control-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Notificações
            </button>
            <button className="control-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Suporte
            </button>
          </div>
        </header>

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
                  {processes.map(p => (
                    <div key={p.id} className="modern-card process-card">
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
                </div>
              </section>
            </div>

            <aside className="right-panel">
              <div className="right-panel-content">
                <section className="simulation-section">
                  <h3 className="section-title">Contexto do Sistema</h3>
                  <div className="modern-card simulation-context">
                    <h5>Multi-perfil Dinâmico</h5>
                    <p className="text-small">
                      Lembre-se: no PiVMA, sua permissão é atribuída por método. 
                      Isso garante que cada etapa do **BraCVAM** seja executada com o rigor necessário.
                    </p>
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-small" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                        Dica: Clique em "Nova Submissão" para simular a triagem da IA.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="demands-section">
                  <h3 className="section-title">Ações Necessárias</h3>
                  <div className="demand-list">
                    {processes.filter(p => p.status.includes('Pendente')).map(p => (
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
                    {processes.every(p => !p.status.includes('Pendente')) && (
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
      </div>
    </div>
  )
}

export default Workspace
