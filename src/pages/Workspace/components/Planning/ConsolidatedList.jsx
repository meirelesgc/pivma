const ConsolidatedList = ({ consolidated }) => {
  if (!consolidated || consolidated.length === 0) {
    return (
      <div className="empty-history-placeholder">
        <p className="text-tertiary text-smaller">Nenhum item consolidado ainda.</p>
      </div>
    )
  }

  return (
    <div className="consolidated-history-list">
      {consolidated.map((item) => (
        <div key={item.id} className="history-item">
          <div className="history-marker">
            <div className="marker-dot"></div>
            <div className="marker-line"></div>
          </div>
          <div className="history-content">
            <div className="history-header">
              <span className="history-title">{item.itemTitle}</span>
              <span className="history-date">{item.date}</span>
            </div>
            <div className="history-meta">
              <div className="avatar-tiny">
                {item.responsible?.substring(0, 1).toUpperCase()}
              </div>
              <span>{item.responsible}</span>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .consolidated-history-list { display: flex; flex-direction: column; }
        .history-item { display: flex; gap: 12px; margin-bottom: 20px; }
        .history-item:last-child { margin-bottom: 0; }
        .history-item:last-child .marker-line { display: none; }
        
        .history-marker { display: flex; flex-direction: column; align-items: center; }
        .marker-dot { 
          width: 10px; height: 10px; border-radius: 50%; 
          background: #009c3b; border: 2px solid white; 
          box-shadow: 0 0 0 1px #009c3b; z-index: 1;
        }
        .marker-line { width: 2px; flex: 1; background: #e0e0e0; margin: 4px 0; }
        
        .history-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .history-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .history-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .history-date { font-size: 10px; color: var(--text-tertiary); white-space: nowrap; }
        .history-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
        
        .empty-history-placeholder { 
          padding: 20px; text-align: center; border: 1px dashed var(--border-color); 
          border-radius: 8px; background: #fafafa;
        }
      `}</style>
    </div>
  )
}

export default ConsolidatedList
