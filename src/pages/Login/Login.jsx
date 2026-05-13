import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMockStore from '../../store/useMockStore'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const setUser = useMockStore((state) => state.setUser)
  
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  })

  const profiles = [
    { name: 'Dr. Eduardo', role: 'Proponente', email: 'eduardo@lab.com', active: true },
    { name: 'Equipe BraCVAM', role: 'Admin', email: 'contato@bracvam.gov.br', active: false },
    { name: 'Laboratório Líder', role: 'Lead Lab', email: 'lider@usp.br', active: false },
    { name: 'Estatístico', role: 'Statistician', email: 'data@stats.com', active: false }
  ]

  const handleSelectProfile = (profile) => {
    if (!profile.active) return
    setCredentials({
      identifier: profile.email,
      password: '••••••••'
    })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const selectedProfile = profiles.find(p => p.email === credentials.identifier)
    if (selectedProfile) {
      setUser(selectedProfile)
      navigate('/workspace')
    }
  }

  return (
    <div className="login-container">
      {/* Mock Selector Tool */}
      <div className="mock-selector floating-card surface-translucent">
        <h3>Seletor de Perfis (Mock)</h3>
        <div className="profile-list">
          {profiles.map((p) => (
            <button 
              key={p.email} 
              className={`profile-item ${!p.active ? 'soon' : ''}`}
              onClick={() => handleSelectProfile(p)}
              disabled={!p.active}
            >
              <span className="name">{p.name}</span>
              <span className="role">{p.role} {!p.active && '(Em breve)'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="login-card floating-card">
        <div className="login-header">
          <div className="simulation-badge">Modo de Simulação</div>
          <h2 className="text-large">Acesse o PiVMA</h2>
          <p className="text-secondary text-small">Entre com suas credenciais ou selecione um perfil mock.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-mail ou CPF</label>
            <input 
              type="text" 
              className="input-field" 
              value={credentials.identifier}
              onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
              placeholder="ex: eduardo@lab.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              className="input-field" 
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Sua senha"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
            Entrar no Sistema
          </button>
        </form>

        <div className="login-footer">
          <a href="#" className="text-small">Esqueceu sua senha?</a>
        </div>
      </div>
    </div>
  )
}

export default Login
