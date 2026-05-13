import { useNavigate, useParams } from 'react-router-dom';
import useMockStore from '../../store/useMockStore';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { processId } = useParams();
  const { user, logout } = useMockStore();

  if (!user) return null;

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
              <div className="nav-section-label" style={{ marginTop: '24px' }}>Método: {processId}</div>
              <div className="nav-item active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Documentos
              </div>
              <div className="nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Equipes
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
