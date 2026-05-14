import { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const LaboratoriesModule = ({ process }) => {
  const { assignParticipant, removeParticipant, user } = useMockStore();
  const [showAddLab, setShowAddLab] = useState(false);
  const [newLab, setNewLab] = useState({ name: '', email: '', role: 'Laboratório Participante', institution: '' });

  const isEditable = user.role === 'Admin' || process.participants.some(p => p.email === user.email && p.role === 'Coordenador Grupo Gestor');

  const handleAddLab = (e) => {
    e.preventDefault();
    assignParticipant(process.id, newLab);
    setNewLab({ name: '', email: '', role: 'Laboratório Participante', institution: '' });
    setShowAddLab(false);
  };

  const roles = [
    'Laboratório Líder',
    'Laboratório Participante'
  ];

  const labs = process.participants.filter(p => roles.includes(p.role));

  return (
    <div className="planning-module modern-card">
      <div className="module-header">
        <div className="module-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </div>
        <div>
          <h3>Laboratórios Participantes</h3>
          <p className="text-tertiary text-small">Definição da rede experimental de ensaios.</p>
        </div>
      </div>

      <div className="module-content">
        <div className="section-header-row">
          <h4>Rede de Laboratórios</h4>
          {isEditable && (
            <button className="btn btn-secondary btn-tiny" onClick={() => setShowAddLab(true)}>
              + Designar Laboratório
            </button>
          )}
        </div>

        <div className="participants-list">
          {labs.length > 0 ? labs.map(p => (
            <div key={p.email} className="participant-item">
              <div className="participant-info">
                <div className="avatar-small" style={{ backgroundColor: p.role === 'Laboratório Líder' ? '#003366' : '#f0f4f8', color: p.role === 'Laboratório Líder' ? 'white' : 'var(--text-primary)' }}>
                  {p.role === 'Laboratório Líder' ? 'L' : 'P'}
                </div>
                <div>
                  <div className="participant-name">{p.institution || p.name}</div>
                  <div className="participant-meta">Resp: {p.name} • {p.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`role-badge ${p.role === 'Laboratório Líder' ? 'role-coordinator' : ''}`}>
                  {p.role}
                </span>
                {isEditable && (
                  <button className="btn-icon-delete" onClick={() => removeParticipant(process.id, p.email)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="empty-state text-tertiary text-small" style={{ textAlign: 'center', padding: '24px' }}>
              Nenhum laboratório designado ainda.
            </div>
          )}
        </div>

        {showAddLab && (
          <div className="modal-overlay">
            <div className="modern-card modal-content" style={{ maxWidth: '400px' }}>
              <h4>Designar Laboratório</h4>
              <form onSubmit={handleAddLab} className="modern-form">
                <div className="form-group">
                  <label>Instituição / Laboratório</label>
                  <input type="text" required value={newLab.institution} onChange={e => setNewLab({...newLab, institution: e.target.value})} placeholder="Ex: Laboratório Nacional de Biociências" />
                </div>
                <div className="form-group">
                  <label>Responsável Técnico</label>
                  <input type="text" required value={newLab.name} onChange={e => setNewLab({...newLab, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>E-mail de Contato</label>
                  <input type="email" required value={newLab.email} onChange={e => setNewLab({...newLab, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Função no Estudo</label>
                  <select value={newLab.role} onChange={e => setNewLab({...newLab, role: e.target.value})}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddLab(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Designar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaboratoriesModule;
