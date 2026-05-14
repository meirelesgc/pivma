import { useState } from 'react';
import useMockStore from '../../../../store/useMockStore';

const ProtocolModule = ({ process }) => {
  const { updateProtocol, user } = useMockStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...process.protocol });

  const isLeader = process.participants.some(p => p.email === user.email && p.role === 'Laboratório Líder');
  const isManager = user.role === 'Admin' || process.participants.some(p => p.email === user.email && p.role === 'Coordenador Grupo Gestor');
  const isEditable = isLeader || isManager;

  const handleSave = () => {
    updateProtocol(process.id, formData);
    setIsEditing(false);
  };

  const handleStatusChange = (status) => {
    updateProtocol(process.id, { status });
  };

  return (
    <div className="planning-module modern-card">
      <div className="module-header">
        <div className="module-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Protocolo Padronizado</h3>
              <p className="text-tertiary text-small">Referência técnica comum para execução dos ensaios.</p>
            </div>
            <div className={`status-badge status-${process.protocol?.status || 'draft'}`}>
              v{process.protocol?.version || '1.0'} • {process.protocol?.status === 'approved' ? 'Aprovado' : process.protocol?.status === 'review' ? 'Em Revisão' : 'Rascunho'}
            </div>
          </div>
        </div>
      </div>

      <div className="module-content">
        <div className="section-header-row">
          <h4>Detalhamento Metodológico</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditable && !isEditing && (
              <button className="btn btn-secondary btn-tiny" onClick={() => setIsEditing(true)}>
                Editar Protocolo
              </button>
            )}
            {isManager && process.protocol?.status !== 'approved' && (
              <button className="btn btn-primary btn-tiny" onClick={() => handleStatusChange('approved')}>
                Aprovar Protocolo
              </button>
            )}
          </div>
        </div>

        <div className="modern-form">
          <div className="form-group">
            <label>Descrição do Método</label>
            {isEditing ? (
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva o princípio biológico e técnico do método..."
                rows={4}
              />
            ) : (
              <p className="text-secondary">{process.protocol?.description || 'Nenhuma descrição fornecida.'}</p>
            )}
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Etapas Experimentais</label>
              {isEditing ? (
                <textarea 
                  value={formData.steps} 
                  onChange={e => setFormData({...formData, steps: e.target.value})}
                  rows={6}
                />
              ) : (
                <p className="text-secondary whitespace-pre">{process.protocol?.steps || 'Não definido.'}</p>
              )}
            </div>
            <div className="form-group">
              <label>Parâmetros Críticos</label>
              {isEditing ? (
                <textarea 
                  value={formData.criticalParameters} 
                  onChange={e => setFormData({...formData, criticalParameters: e.target.value})}
                  rows={6}
                />
              ) : (
                <p className="text-secondary whitespace-pre">{process.protocol?.criticalParameters || 'Não definido.'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Salvar Alterações</button>
            </div>
          )}
        </div>

        <div className="protocol-footer text-tiny text-tertiary" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          Última atualização: {process.protocol?.updatedAt ? new Date(process.protocol.updatedAt).toLocaleString() : 'N/A'} por {process.protocol?.updatedBy || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default ProtocolModule;
