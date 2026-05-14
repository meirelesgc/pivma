import GovernanceModule from './GovernanceModule';
import LaboratoriesModule from './LaboratoriesModule';
import ProtocolModule from './ProtocolModule';

const PlanningStage = ({ process }) => {
  const futureModules = [
    { title: 'Desenho do Estudo e Desfechos', icon: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z' },
    { title: 'Gestão de Amostras (Cego)', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { title: 'Plano Estatístico', icon: 'M18 20V10M12 20V4M6 20v-6' },
    { title: 'Especialistas Independentes', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { title: 'Gestão Documental', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' }
  ];

  return (
    <div className="planning-stage-container">
      <div className="planning-grid">
        <div className="active-modules">
          <GovernanceModule process={process} />
          <LaboratoriesModule process={process} />
          <ProtocolModule process={process} />
        </div>
        
        <div className="upcoming-modules">
          <h4 className="section-title" style={{ paddingLeft: '12px' }}>Próximos Módulos</h4>
          {futureModules.map((m, index) => (
            <div key={index} className="modern-card upcoming-card">
              <div className="module-header" style={{ opacity: 0.6 }}>
                <div className="module-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {m.title === 'Plano Estatístico' ? (
                      <>
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </>
                    ) : (
                      <path d={m.icon}></path>
                    )}
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{m.title}</h4>
                  <div className="coming-soon-badge">Em breve</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningStage;
