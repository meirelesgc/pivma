import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = ({ isLight, onThemeToggle }) => {
  return (
    <div className="landing-container">
      {/* Cabeçalho */}
      <header className="landing-header">
        <div className="logo">
          <div className="logo-icon" />
          <span className="logo-text">PiVMA</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="login-link">Entrar</Link>
          <button className="btn btn-primary">Nova Submissão</button>
        </div>
      </header>

      {/* Seção Principal (Hero) */}
      <main className="landing-hero">
        <div className="hero-label">
          Plataforma de Validação de Métodos Alternativos
        </div>
        <h1 className="hero-title">
          Eficiência e Precisão na<br />
          Validação de Métodos
        </h1>
        <p className="hero-description">
          Simplificando o processo de validação de métodos alternativos com colaboração em tempo real, 
          rastreabilidade completa e análise inteligente de dados.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary">
            Começar Agora
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn btn-secondary">Saiba Mais</button>
        </div>
      </main>

      {/* Seção de Recursos (Cards) */}
      <section className="landing-features">
        <div className="feature-card floating-card">
          <h3>Colaboração</h3>
          <p>
            Conecte proponentes, laboratórios e especialistas em um único ambiente integrado para 
            gestão fluida de projetos de validação.
          </p>
        </div>
        <div className="feature-card floating-card">
          <h3>Rastreabilidade</h3>
          <p>
            Controle total sobre cada etapa do processo, com registro histórico de dados, 
            amostras e decisões técnicas centralizadas.
          </p>
        </div>
        <div className="feature-card floating-card">
          <h3>Transparência</h3>
          <p>
            Garantia de integridade e visibilidade em todas as fases, desde a submissão inicial 
            até a decisão regulatória final.
          </p>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="landing-footer">
        <div className="footer-copyright">
          © 2026 BraCVAM - Centro Brasileiro de Validação de Métodos Alternativos
        </div>
        <button className="footer-theme-toggle" onClick={onThemeToggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isLight ? (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            ) : (
              <>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </>
            )}
          </svg>
          Tema {isLight ? 'Escuro' : 'Claro'}
        </button>
      </footer>
    </div>
  );
};

export default Landing;
