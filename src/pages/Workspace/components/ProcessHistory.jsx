const ProcessHistory = ({ history }) => {
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOriginIcon = (event) => {
    if (event.type === 'transition') {
      return (
        <div className="history-icon transition" style={{ borderColor: '#6366f1', color: '#6366f1' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
      );
    }
    if (event.origin === 'system') {
      return (
        <div className="history-icon system">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
        </div>
      );
    }
    return (
      <div className="history-icon human">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
    );
  };

  return (
    <div className="process-history-container modern-card">
      <h3 className="section-title">Histórico de Alterações e Rastreabilidade</h3>
      
      <div className="timeline">
        {history.slice().reverse().map((event, index) => (
          <div key={index} className={`timeline-event ${event.origin}`}>
            <div className="timeline-marker">
              {getOriginIcon(event)}
              {index !== history.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className="event-content">
              <div className="event-header">
                <span className="event-actor">{event.actor}</span>
                <span className="event-time">{formatTime(event.timestamp)}</span>
              </div>
              <div className="event-description">
                {event.description}
              </div>
              <div className="event-type-badge">
                {event.type.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessHistory;
