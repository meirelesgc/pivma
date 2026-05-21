import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'

const RoleAssignment = ({ process, demand, onComplete }) => {
  const { assignParticipant, completePlanningDemand } = useMockStore()
  
  const [formData, setFormData] = useState({
    userId: '',
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
    if (!formData.userId) return

    const selectedUser = availableUsers.find(u => u.id === formData.userId)
    
    // 1. Assign participant contextual role
    assignParticipant(process.id, {
      name: selectedUser.name,
      email: selectedUser.email,
      role: formData.role,
      institution: selectedUser.institution,
      scope: formData.scope
    })

    // 2. Complete the demand
    completePlanningDemand(process.id, demand.id, {
      itemTitle: 'Grupo de Amostras Definido',
      origin: 'Grupo Gestor'
    })

    if (onComplete) onComplete()
  }

  return (
    <form className="planning-form" onSubmit={handleSubmit}>
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

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!formData.userId}>
          Salvar Vínculo Contextual
        </button>
      </div>
    </form>
  )
}

export default RoleAssignment
