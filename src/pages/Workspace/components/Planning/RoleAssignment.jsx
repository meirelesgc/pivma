import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'

const RoleAssignment = ({ process, demand, onComplete }) => {
  const { assignParticipant, inviteExternalUser, consolidateDemand, saveDemandDraft } = useMockStore()
  
  const [mode, setMode] = useState('USER') // USER, GROUP, EXTERNAL
  const [formData, setFormData] = useState({
    userId: '',
    externalEmail: '',
    externalName: '',
    role: 'Grupo de Amostras', // Default for this specific demand
    scope: 'Coordenação e Codificação'
  })

  // Mock users available in the platform
  const availableUsers = [
    { id: 'u1', name: 'João Silva', email: 'joao@lab.com', institution: 'LabCentral' },
    { id: 'u2', name: 'Maria Souza', email: 'maria@bio.br', institution: 'BioTech' },
    { id: 'u3', name: 'Dr. Roberto', email: 'roberto@pesquisa.org', institution: 'Inst. Pesquisa' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (mode === 'USER') {
      if (!formData.userId) return
      const selectedUser = availableUsers.find(u => u.id === formData.userId)
      assignParticipant(process.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        role: formData.role,
        institution: selectedUser.institution,
        scope: formData.scope
      })
    } else if (mode === 'EXTERNAL') {
      if (!formData.externalEmail || !formData.externalName) return
      inviteExternalUser(process.id, formData.externalEmail, formData.externalName, formData.role)
    } else {
      // GROUP mode - In this MVP, it just marks the demand as consolidated with the group label
      // already registered in the demand targetId/Name
    }

    consolidateDemand(process.id, demand.id)
    if (onComplete) onComplete()
  }

  const handleSaveDraft = () => {
    saveDemandDraft(process.id, demand.id, formData)
    alert('Rascunho salvo com sucesso!')
  }

  return (
    <div className="planning-form-container">
      <div className="tab-selector" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          className={`btn-tiny ${mode === 'USER' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('USER')}
        >
          Usuário Interno
        </button>
        <button 
          className={`btn-tiny ${mode === 'GROUP' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('GROUP')}
        >
          Grupo Coletivo
        </button>
        <button 
          className={`btn-tiny ${mode === 'EXTERNAL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('EXTERNAL')}
        >
          Convidar Externo
        </button>
      </div>

      <form className="planning-form" onSubmit={handleSubmit}>
        {mode === 'USER' && (
          <div className="form-group">
            <label>Selecionar Usuário</label>
            <select 
              value={formData.userId} 
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="">Selecione um usuário cadastrado...</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.institution})</option>
              ))}
            </select>
          </div>
        )}

        {mode === 'EXTERNAL' && (
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Convidado</label>
              <input 
                type="text" 
                value={formData.externalName} 
                onChange={(e) => setFormData({ ...formData, externalName: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input 
                type="email" 
                value={formData.externalEmail} 
                onChange={(e) => setFormData({ ...formData, externalEmail: e.target.value })}
                placeholder="ex: joao@gmail.com"
                required
              />
            </div>
          </div>
        )}

        {mode === 'GROUP' && (
          <div className="info-box-light" style={{ padding: '12px', background: 'rgba(var(--primary-color-rgb), 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
            <p className="text-small">
              A responsabilidade será atribuída coletivamente ao papel: <strong>{formData.role}</strong>.
              Qualquer membro futuro vinculado a este papel poderá visualizar e interagir com as tarefas.
            </p>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Papel Institucional</label>
            <input type="text" value={formData.role} readOnly className="input-disabled" />
          </div>
          <div className="form-group">
            <label>Escopo de Atuação</label>
            <input 
              type="text" 
              value={formData.scope} 
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              placeholder="Ex: Responsável pela logística"
            />
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="action-link" onClick={handleSaveDraft}>
            Salvar como Rascunho
          </button>
          <button type="submit" className="btn btn-primary">
            Consolidar Atribuição
          </button>
        </div>
      </form>
    </div>
  )
}

export default RoleAssignment
