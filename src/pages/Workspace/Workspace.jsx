import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useMockStore from '../../store/useMockStore'
import { MACRO_STAGES, PROCESS_STATES } from '../../config/processStates'
import MethodForm from './components/MethodForm'
import TriagePanel from './components/TriagePanel'
import ProcessHistory from './components/ProcessHistory'
import PlanningStage from './components/Planning/PlanningStage'
import ExecutionStage from './components/Execution/ExecutionStage'
import './Workspace.css'
import './components/components.css'

const getStatusClass = (status, stateId) => {
  if (stateId === 'PENDENTE_AJUSTE') return 'status-pendente'
  if (stateId === 'TRIAGEM_IA') return 'status-triagem'
  if (stateId === 'SUBMETIDO') return 'status-triagem'
  if (stateId === 'APTO' || stateId === 'PLANEJAMENTO') return 'status-contestado' // reusing color for "active/approved"
  return 'status-rascunho'
}

const ProcessCard = ({ process, onClick, className = '' }) => (
  <div 
    className={`modern-card process-card ${className}`}
    onClick={() => onClick(process.id)}
    style={{ cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="process-role">{process.role}</div>
      <div className={`status-badge ${getStatusClass(process.status, process.currentState)}`}>
        {process.status}
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <h3 style={{ margin: 0 }}>{process.name}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="text-tertiary" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proponente:</span>
        <span className="text-secondary text-smaller">{process.technicalLead}</span>
      </div>
    </div>
    <p className="text-secondary text-small" style={{ flex: 1, lineBreak: 'anywhere' }}>{process.description}</p>
    <div className="process-footer">
      <span>ID: {process.id}</span>
      <span>Ativado há 3 dias</span>
    </div>
  </div>
)

const Workspace = () => {
  const navigate = useNavigate()
  const { processId } = useParams()
  const { user, processes, setSelectedProcessId } = useMockStore()
  
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'columns'
  const [groupBy, setGroupBy] = useState('stage') // 'stage' | 'role'
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated') // 'updated' | 'name' | 'id'

  useEffect(() => {
    setSelectedProcessId(processId || null)
  }, [processId, setSelectedProcessId])

  if (!user) {
    navigate('/login')
    return null
  }

  // Admin (Equipe BraCVAM) sees everything, others see their own
  const userProcesses = useMemo(() => {
    let filtered = ['Admin', 'Org. de Validação (Admin)'].includes(user.role) 
      ? processes 
      : processes.filter(p => p.ownerEmail === user.email || p.participants?.some(part => part.email === user.email));

    // Apply Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.id.toLowerCase().includes(term) ||
        p.technicalLead?.toLowerCase().includes(term)
      );
    }

    // Apply Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [processes, user.role, user.email, searchTerm, sortBy]);

  const groupedProcesses = useMemo(() => {
    if (viewMode !== 'columns') return null;

    if (groupBy === 'stage') {
      const stages = Object.values(MACRO_STAGES).sort((a, b) => a.order - b.order);
      return stages.map(stage => ({
        id: stage.id,
        label: stage.label,
        items: userProcesses.filter(p => PROCESS_STATES[p.currentState]?.macroStage.id === stage.id)
      }));
    }

    if (groupBy === 'role') {
      const roles = [...new Set(userProcesses.map(p => p.role || 'Sem Função'))];
      return roles.map(role => ({
        id: role,
        label: role,
        items: userProcesses.filter(p => (p.role || 'Sem Função') === role)
      }));
    }

    return null;
  }, [viewMode, groupBy, userProcesses]);

  // Demands based on role and state
  const userDemands = processes.filter(p => {
    if (['Admin', 'Org. de Validação (Admin)'].includes(user.role)) {
      return p.currentState === 'SUBMETIDO' || (p.currentState === 'TRIAGEM_IA' && p.iaStatus === 'Apto');
    } else {
      return (p.ownerEmail === user.email) && (p.currentState === 'PENDENTE_AJUSTE');
    }
  })

  const selectedProcess = processes.find(p => p.id === processId)

  const handleNewSubmission = () => {
    navigate('/new-submission')
  }

  if (processId && selectedProcess) {
    const isPlanningStage = selectedProcess.currentState === 'PLANEJAMENTO' || selectedProcess.currentState === 'PREPARACAO';
    const isExecutionStage = selectedProcess.currentState === 'EXECUCAO_METODO';

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

        {isExecutionStage ? (
          <ExecutionStage process={selectedProcess} />
        ) : isPlanningStage ? (
          <PlanningStage process={selectedProcess} />
        ) : (
          <div className="process-context-grid">
            <div className="form-column">
              <MethodForm process={selectedProcess} />
            </div>
            <div className="triage-column">
              <TriagePanel process={selectedProcess} />
            </div>
          </div>
        )}

        <div className="history-row">
          <ProcessHistory history={selectedProcess.history} />
        </div>
      </main>
    )
  }

  return (
    <main className={`workspace-content ${viewMode === 'columns' ? 'view-columns' : ''}`}>
      <div className="content-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h2 style={{ margin: 0 }}>Seus Métodos</h2>
          
          <div className="view-controls">
            <div className="control-group search-box-wrapper">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Buscar por nome ou ID..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="control-group">
              <span className="control-label">Vista:</span>
              <div className="btn-toggle-group">
                <button 
                  className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista em Cartões"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button 
                  className={`btn-toggle ${viewMode === 'columns' ? 'active' : ''}`}
                  onClick={() => setViewMode('columns')}
                  title="Vista em Colunas"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path></svg>
                </button>
              </div>
            </div>

            {viewMode === 'grid' && (
              <div className="control-group">
                <span className="control-label">Ordenar:</span>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updated">Recentes</option>
                  <option value="name">Nome (A-Z)</option>
                  <option value="id">ID</option>
                </select>
              </div>
            )}

            {viewMode === 'columns' && (
              <div className="control-group">
                <span className="control-label">Agrupar por:</span>
                <div className="btn-toggle-group">
                  <button 
                    className={`btn-toggle ${groupBy === 'stage' ? 'active' : ''}`}
                    onClick={() => setGroupBy('stage')}
                  >
                    Etapa
                  </button>
                  <button 
                    className={`btn-toggle ${groupBy === 'role' ? 'active' : ''}`}
                    onClick={() => setGroupBy('role')}
                  >
                    Função
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {['Proponente', 'Patrocinador / Proponente'].includes(user.role) && (
          <button className="btn btn-primary" onClick={handleNewSubmission} style={{ height: '44px', padding: '0 24px', borderRadius: '12px' }}>
            + Nova Submissão
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="left-panel">
          <section className="processes-section">
            <h3 className="section-title">Fluxo de Validação</h3>
            
            {viewMode === 'grid' ? (
              <div className="process-grid">
                {userProcesses.map(p => (
                  <ProcessCard key={p.id} process={p} onClick={(id) => navigate(`/workspace/${id}`)} />
                ))}
                {userProcesses.length === 0 && (
                  <div className="modern-card" style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                    <p className="text-secondary">Você ainda não possui métodos submetidos.</p>
                    <p className="text-tertiary text-small" style={{ marginTop: '8px' }}>Clique em "Nova Submissão" para começar.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="kanban-board">
                {groupedProcesses.map(group => (
                  <div key={group.id} className="kanban-column">
                    <div className="kanban-column-header">
                      <h4>{group.label}</h4>
                      <span className="column-count">{group.items.length}</span>
                    </div>
                    <div className="kanban-cards">
                      {group.items.map(p => (
                        <ProcessCard key={p.id} process={p} className="kanban-card" onClick={(id) => navigate(`/workspace/${id}`)} />
                      ))}
                      {group.items.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-m)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                          Nenhuma atividade nesta coluna
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {viewMode === 'grid' && (
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
                          {['Admin', 'Org. de Validação (Admin)'].includes(user.role) 
                            ? `Validar triagem em: ${p.id}` 
                            : `Ajuste solicitado por IA em: ${p.id}`
                          }
                        </h4>
                        <p>
                          {['Admin', 'Org. de Validação (Admin)'].includes(user.role)
                            ? 'IA concluiu triagem com sucesso (Score > 80%).'
                            : 'Score de prontidão insuficiente (65%).'
                          }
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); navigate(`/workspace/${p.id}`); }}>
                          {['Admin', 'Org. de Validação (Admin)'].includes(user.role) ? 'Analisar e Aprovar' : 'Ver detalhes e contestar'}
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
        )}
      </div>
    </main>
  )
}

export default Workspace
