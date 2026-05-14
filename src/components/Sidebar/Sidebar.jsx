import { useNavigate, useParams } from 'react-router-dom';
import useMockStore from '../../store/useMockStore';
import { MACRO_STAGES, isStageUnlocked, PROCESS_STATES } from '../../config/processStates';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { processId } = useParams();
  const { user, logout, processes } = useMockStore();

  if (!user) return null;

  const selectedProcess = processes.find(p => p.id === processId);
  const currentStateId = selectedProcess?.currentState || 'RASCUNHO';
  const currentMacroStage = PROCESS_STATES[currentStateId]?.macroStage.id;

  const renderMacroStages = () => {
    return Object.values(MACRO_STAGES).sort((a, b) => a.order - b.order).map(stage => {
      const unlocked = isStageUnlocked(currentStateId, stage.id);
      const isActive = currentMacroStage === stage.id;

      return (
        <div 
          key={stage.id}
          className={`nav-item ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
          title={unlocked ? '' : 'Etapa bloqueada'}
        >
          <div className="macro-stage-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {stage.order === 1 && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>}
                {stage.order === 2 && <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>}
                {stage.order === 3 && <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>}
                {stage.order === 4 && <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>}
                {stage.order === 1 && <polyline points="14 2 14 8 20 8"></polyline>}
                {stage.order === 2 && <line x1="16" y1="2" x2="16" y2="6"></line>}
                {stage.order === 2 && <line x1="8" y1="2" x2="8" y2="6"></line>}
                {stage.order === 2 && <line x1="3" y1="10" x2="21" y2="10"></line>}
                {stage.order === 4 && <polyline points="22 4 12 14.01 9 11.01"></polyline>}
              </svg>
              <span>{stage.label}</span>
            </div>
            {!unlocked && (
              <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <aside className="global-sidebar">
      <div className="sidebar-top">
        <nav className="sidebar-nav">
          <div className="nav-section-label">Plataforma</div>
          <div 
            className={`nav-item ${!processId ? 'active' : ''}`}
            onClick={() => navigate('/workspace')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </div>
          
          {processId && (
            <>
              <div className="nav-section-label" style={{ marginTop: '24px' }}>Fluxo do Método</div>
              {renderMacroStages()}
              
              <div className="nav-section-label" style={{ marginTop: '24px' }}>Recursos</div>
              <div className="nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Equipes
              </div>
              <div className="nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Chat do Processo
              </div>
            </>
          )}
        </nav>
      </div>

      <div className="sidebar-user-section">
        <div className="user-profile-info">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <button className="logout-button" onClick={() => {
          logout();
          navigate('/');
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sair da Conta
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
