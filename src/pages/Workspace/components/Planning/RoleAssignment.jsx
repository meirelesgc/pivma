import { useState, useMemo } from 'react'
import useMockStore from '../../../../store/useMockStore'

const GD34_ROLES = [
  { id: 'LABORATORIO_LIDER', label: 'Laboratório Líder', category: 'Technical', description: 'Responsável pela padronização do protocolo.' },
  { id: 'LABORATORIO_PARTICIPANTE', label: 'Laboratório Participante', category: 'Technical', description: 'Executa os testes interlaboratoriais.' },
  { id: 'GESTOR_AMOSTRAS', label: 'Gestor de Amostras', category: 'Logistics', description: 'Responsável pela logística e cegamento.' },
  { id: 'REVISOR_AD_HOC', label: 'Revisor Independente', category: 'Review', description: 'Especialista para o Peer Review.' }
]

const RoleAssignment = ({ process, demand, onComplete }) => {
  const { assignParticipant, inviteExternalUser, consolidateDemand, removeParticipant } = useMockStore()
  
  const initialRole = useMemo(() => {
    if (demand?.suggestedRole) {
      return GD34_ROLES.find(r => r.id === demand.suggestedRole) || GD34_ROLES[0]
    }
    return GD34_ROLES[0]
  }, [demand])

  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedRole, setSelectedRole] = useState(initialRole)

  // Mock users for the searchable combobox
  const availableUsers = [
    { id: 'u1', name: 'João Silva', email: 'joao@lab.com', institution: 'LabCentral' },
    { id: 'u2', name: 'Maria Souza', email: 'maria@bio.br', institution: 'BioTech' },
    { id: 'u3', name: 'Dr. Roberto', email: 'roberto@pesquisa.org', institution: 'Inst. Pesquisa' },
    { id: 'u4', name: 'Dra. Helena', email: 'helena@stats.com', institution: 'DataScience Unit' }
  ]

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return []
    return availableUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.institution.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const currentParticipants = useMemo(() => {
    return (process.participants || []).filter(p => 
      GD34_ROLES.some(r => r.id === p.role)
    )
  }, [process.participants])

  const handleSelectUser = (user) => {
    assignParticipant(process.id, {
      name: user.name,
      email: user.email,
      role: selectedRole.id,
      institution: user.institution
    })
    setSearchTerm('')
    setShowDropdown(false)
  }

  const handleInviteExternal = () => {
    const name = prompt('Nome do Especialista / Instituição:')
    const email = prompt('E-mail para convite:')
    
    if (name && email) {
      inviteExternalUser(process.id, email, name, selectedRole.id)
      setSearchTerm('')
      setShowDropdown(false)
    }
  }

  const handleConsolidate = () => {
    // Check if critical roles are filled
    const hasLeader = currentParticipants.some(p => p.role === 'LABORATORIO_LIDER')
    
    if (!hasLeader) {
      alert('É necessário definir ao menos o Laboratório Líder antes de consolidar.')
      return
    }

    consolidateDemand(process.id, demand.id)
    if (onComplete) onComplete()
  }

  return (
    <div className="role-assignment-workspace">
      <div className="workspace-intro">
        <p className="text-secondary">Atribua os papéis principais conforme o Guia GD34 para iniciar a fase de planejamento técnico.</p>
      </div>

      <section className="role-selector-section">
        <div className="role-type-pills">
          {GD34_ROLES.map(role => (
            <button 
              key={role.id}
              className={`role-pill ${selectedRole.id === role.id ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role.label}
            </button>
          ))}
        </div>

        <div className="user-search-container">
          <label className="text-smaller text-tertiary">BUSCAR RESPONSÁVEL PARA: {selectedRole.label}</label>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Digite o nome ou instituição do especialista..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && (
              <div className="search-results-dropdown">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="search-result-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="entity-avatar">{user.name[0]}</div>
                      <div className="search-result-info">
                        <span className="entity-name">{user.name}</span>
                        <span className="entity-institution">{user.institution}</span>
                      </div>
                    </div>
                  ))
                ) : searchTerm && (
                  <div className="search-empty-state">
                    <p className="text-smaller">Nenhum especialista interno encontrado.</p>
                  </div>
                )}
                <div 
                  className="search-result-item invite-external-trigger"
                  onClick={handleInviteExternal}
                >
                  <div className="entity-avatar">+</div>
                  <div className="search-result-info">
                    <span className="entity-name" style={{ color: 'var(--primary-color)' }}>Convidar Especialista Externo...</span>
                    <span className="entity-institution">Clique para adicionar via e-mail</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="current-structure-section">
        <h4 className="section-title">Estrutura de Governança Atual</h4>
        <div className="role-cards-grid">
          {GD34_ROLES.map(role => {
            const assigned = currentParticipants.filter(p => p.role === role.id)
            return (
              <div key={role.id} className={`role-entity-card ${assigned.length === 0 ? 'empty' : ''}`}>
                <div className="role-card-header">
                  <span className="role-badge">{role.label}</span>
                </div>
                
                {assigned.length > 0 ? (
                  assigned.map(p => (
                    <div key={p.email} className="assigned-participant">
                      <div className="role-entity-info">
                        <div className="entity-avatar">{p.name[0]}</div>
                        <div>
                          <span className="entity-name">{p.name}</span>
                          <span className="entity-institution">{p.institution}</span>
                        </div>
                      </div>
                      <button 
                        className="btn-remove" 
                        onClick={() => removeParticipant(process.id, p.email)}
                        title="Remover"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-role-placeholder">
                    <span className="text-smaller text-tertiary">Não designado</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div className="workspace-footer">
        <div className="footer-summary">
          <span className="text-small"><strong>{currentParticipants.length}</strong> especialistas atribuídos</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-primary" onClick={handleConsolidate}>
            Consolidar e Publicar Estrutura
          </button>
        </div>
      </div>

      <style>{`
        .role-assignment-workspace { display: flex; flex-direction: column; gap: 32px; }
        .role-type-pills { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .role-pill { 
          padding: 8px 16px; 
          border-radius: 20px; 
          border: 1px solid var(--border-color); 
          background: white; 
          font-size: 12px; 
          cursor: pointer; 
          transition: all 0.2s;
        }
        .role-pill.active { 
          background: var(--primary-color); 
          color: white; 
          border-color: var(--primary-color); 
        }
        .role-entity-card.empty { border-style: dashed; background: #fafafa; }
        .assigned-participant { display: flex; justify-content: space-between; align-items: center; }
        .btn-remove { 
          background: none; border: none; color: var(--text-tertiary); 
          font-size: 18px; cursor: pointer; padding: 4px;
        }
        .btn-remove:hover { color: #ff4d4f; }
        .empty-role-placeholder { padding: 8px 0; font-style: italic; }
        .workspace-footer { 
          margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-color); 
          display: flex; justify-content: space-between; align-items: center;
        }
      `}</style>
    </div>
  )
}

export default RoleAssignment
