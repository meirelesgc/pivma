const ConsolidatedList = ({ consolidated }) => {
  if (!consolidated || consolidated.length === 0) {
    return (
      <div className="modern-card" style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.01)', borderStyle: 'dashed' }}>
        <p className="text-tertiary text-small">Nenhum item consolidado ainda.</p>
        <p className="text-smaller text-tertiary" style={{ marginTop: '4px' }}>Conclua demandas para gerar a trilha operacional.</p>
      </div>
    )
  }

  return (
    <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
      <table className="consolidated-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Data</th>
            <th>Responsável</th>
          </tr>
        </thead>
        <tbody>
          {consolidated.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{item.itemTitle}</div>
                <div className="text-smaller text-tertiary">{item.origin}</div>
              </td>
              <td className="text-secondary">{item.date}</td>
              <td>
                <div className="consolidated-responsible">
                  <div className="avatar-tiny">
                    {item.responsible?.substring(0, 1).toUpperCase()}
                  </div>
                  <span>{item.responsible}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ConsolidatedList
