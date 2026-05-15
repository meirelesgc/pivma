import { useState } from 'react';
import { createPortal } from 'react-dom';
import useMockStore from '../../../../store/useMockStore';

const GovernanceModule = ({ process }) => {
  const { assignParticipant, removeParticipant, updateSponsor, user } = useMockStore();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Membro Grupo Gestor', institution: '' });

  const isEditable = user.role === 'Admin' || process.participants.some(p => p.email === user.email && p.role === 'Coordenador Grupo Gestor');

  const handleAddMember = (e) => {
    e.preventDefault();
    assignParticipant(process.id, newMember);
    setNewMember({ name: '', email: '', role: 'Membro Grupo Gestor', institution: '' });
    setShowAddMember(false);
  };

  const roles = [
    'Coordenador Grupo Gestor',
    'Membro Grupo Gestor',
    'Representante Patrocinador',
    'Observador'
  ];

  const Modal = () => (
    <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
      <div className="modern-card modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <h4>Novo Participante</h4>
        <form onSubmit={handleAddMember} className="modern-form">
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" required value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Instituição</label>
            <input type="text" required value={newMember.institution} onChange={e => setNewMember({...newMember, institution: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Função no Grupo</label>
            <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddMember(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="planning-module modern-card">
      <div className="module-header">
        <div className="module-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div>
          <h3>Equipe Gestora e Patrocinador</h3>
          <p className="text-tertiary text-small">Definição da governança institucional do estudo.</p>
        </div>
      </div>

      <div className="module-content">
        <section className="governance-section">
          <div className="section-header-row">
            <h4>Patrocinador do Estudo</h4>
          </div>
          <div className="sponsor-grid modern-form">
            <div className="form-group">
              <label>Nome Institucional</label>
              <input 
                type="text" 
                value={process.sponsor?.name || ''} 
                onChange={(e) => updateSponsor(process.id, { name: e.target.value })}
                disabled={!isEditable}
                placeholder="Ex: Ministério da Ciência e Tecnologia"
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select 
                value={process.sponsor?.category || ''} 
                onChange={(e) => updateSponsor(process.id, { category: e.target.value })}
                disabled={!isEditable}
              >
                <option value="">Selecione...</option>
                <option value="Governamental">Governamental</option>
                <option value="Privado">Privado / Indústria</option>
                <option value="Acadêmico">Acadêmico / Fundação</option>
                <option value="Internacional">Internacional</option>
              </select>
            </div>
          </div>
        </section>

        <div className="status-divider" style={{ margin: '24px 0' }}></div>

        <section className="governance-section">
          <div className="section-header-row">
            <h4>Membros do Grupo Gestor</h4>
            {isEditable && (
              <button className="btn btn-secondary btn-tiny" onClick={() => setShowAddMember(true)}>
                + Adicionar Membro
              </button>
            )}
          </div>

          <div className="participants-list">
            {process.participants.filter(p => roles.includes(p.role) || p.role === 'Equipe BraCVAM').map(p => (
              <div key={p.email} className="participant-item">
                <div className="participant-info">
                  <div className="avatar-small">{p.name.charAt(0)}</div>
                  <div>
                    <div className="participant-name">{p.name} {p.email === user.email && <span className="text-tertiary">(Você)</span>}</div>
                    <div className="participant-meta">{p.institution} • {p.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`role-badge ${p.role === 'Coordenador Grupo Gestor' ? 'role-coordinator' : ''}`}>
                    {p.role}
                  </span>
                  {isEditable && p.role !== 'Equipe BraCVAM' && p.email !== process.ownerEmail && (
                    <button className="btn-icon-delete" onClick={() => removeParticipant(process.id, p.email)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showAddMember && createPortal(<Modal />, document.body)}
        </section>
      </div>
    </div>
  );
};

export default GovernanceModule;
