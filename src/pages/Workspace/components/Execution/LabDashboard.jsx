import { useState, useEffect } from 'react';
import useMockStore from '../../../../store/useMockStore';
import useProtocolDefinitionStore from '../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import { 
  FiDownload, 
  FiUpload, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiInfo,
  FiFileText,
  FiRefreshCw,
  FiClock
} from 'react-icons/fi';
import './Execution.css';

const LabDashboard = ({ process }) => {
  const { user, uploadTemplateSubmission } = useMockStore();
  const { sheets, loadProtocol } = useProtocolDefinitionStore();
  const [activeTab, setActiveTab] = useState('templates');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock loading protocol if not already loaded in the store
  // In a real app, this would be fetched from the process object
  useEffect(() => {
    if (sheets.length === 0) {
      // Mock some sheets if none exist for demonstration
      loadProtocol({
        sheets: [
          { id: 's1', name: 'Dados Brutos - OD570', type: 'raw_data', required: true, status: 'TEMPLATE_GENERATED' },
          { id: 's2', name: 'Preparação de Soluções', type: 'solution_prep', required: true, status: 'TEMPLATE_GENERATED' },
          { id: 's3', name: 'Recebimento de Amostras', type: 'sample_receipt', required: true, status: 'TEMPLATE_GENERATED' },
          { id: 's4', name: 'Ocorrências e Desvios', type: 'occurrences', required: false, status: 'TEMPLATE_GENERATED' }
        ]
      });
    }
  }, [sheets.length, loadProtocol]);

  const submissions = process.templateSubmissions || [];
  
  const getLatestSubmission = (sheetId) => {
    return submissions
      .filter(s => s.sheetId === sheetId && s.labEmail === user.email)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  };

  const handleUpload = (sheetId, file) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      uploadTemplateSubmission(process.id, sheetId, {
        name: file.name,
        size: file.size
      });
      setIsUploading(false);
      setUploadProgress(0);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALIDATED':
        return <span className="badge badge-success"><FiCheckCircle /> Validado</span>;
      case 'VALIDATION_FAILED':
        return <span className="badge badge-danger"><FiXCircle /> Falha na Validação</span>;
      case 'VALIDATING':
        return <span className="badge badge-warning"><FiRefreshCw className="spin" /> Validando...</span>;
      case 'TEMPLATE_GENERATED':
        return <span className="badge badge-neutral"><FiFileText /> Template Disponível</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="lab-dashboard">
      <header className="dashboard-header">
        <div className="header-info">
          <h3>Painel do Laboratório Participante</h3>
          <p className="text-secondary">Execute o protocolo interlaboratorial e submeta os dados regulatórios.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <FiDownload /> Baixar Guia de Execução
          </button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates e Coleta
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico de Submissões
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Amostras e Inventário
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'templates' && (
          <div className="templates-grid">
            {sheets.map(sheet => {
              const latest = getLatestSubmission(sheet.id);
              const status = latest ? latest.status : sheet.status;

              return (
                <div key={sheet.id} className={`template-card modern-card ${status === 'VALIDATION_FAILED' ? 'border-error' : ''}`}>
                  <div className="card-header">
                    <div className="sheet-icon">
                      <FiFileText />
                    </div>
                    <div className="sheet-info">
                      <h4>{sheet.name}</h4>
                      <span className="sheet-type">{sheet.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="sheet-status">
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  <div className="card-body">
                    {latest ? (
                      <div className="latest-info">
                        <div className="info-row">
                          <FiClock /> <span>{new Date(latest.uploadedAt).toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                          <FiFileText /> <span>{latest.fileName}</span>
                        </div>
                        
                        {latest.validationLogs && latest.validationLogs.length > 0 && (
                          <div className="validation-summary">
                            <h5>Resultado da Validação:</h5>
                            <ul className="log-list">
                              {latest.validationLogs.map((log, i) => (
                                <li key={i} className={`log-item ${log.status}`}>
                                  {log.status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                                  <span>{log.message}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {latest.status === 'VALIDATED' && (
                          <div className="data-preview-summary">
                            <div className="preview-header">
                              <FiInfo /> <span>Dados Extraídos (Resumo)</span>
                            </div>
                            <div className="preview-grid">
                              <div className="preview-item">
                                <span className="p-label">Média OD</span>
                                <span className="p-value">0.842</span>
                              </div>
                              <div className="preview-item">
                                <span className="p-label">Desvio Padrão</span>
                                <span className="p-value">0.021</span>
                              </div>
                              <div className="preview-item">
                                <span className="p-label">CV (%)</span>
                                <span className="p-value">2.5%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Nenhuma submissão realizada para este template.</p>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <button className="btn btn-outline-primary btn-sm">
                      <FiDownload /> Baixar Template
                    </button>
                    <div className="upload-wrapper">
                      <input 
                        type="file" 
                        id={`upload-${sheet.id}`} 
                        hidden 
                        onChange={(e) => handleUpload(sheet.id, e.target.files[0])}
                        accept=".xlsx, .xls"
                      />
                      <label htmlFor={`upload-${sheet.id}`} className="btn btn-primary btn-sm">
                        <FiUpload /> {latest ? 'Reenviar' : 'Enviar Dados'}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-table-container modern-card">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Arquivo</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Operador</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length > 0 ? (
                  submissions.map(sub => (
                    <tr key={sub.id}>
                      <td>{new Date(sub.uploadedAt).toLocaleString()}</td>
                      <td>{sub.fileName}</td>
                      <td>{sheets.find(s => s.id === sub.sheetId)?.name || 'Desconhecido'}</td>
                      <td>{getStatusBadge(sub.status)}</td>
                      <td>{sub.uploadedBy}</td>
                      <td>
                        <button className="btn-icon" title="Ver Detalhes"><FiInfo /></button>
                        <button className="btn-icon" title="Download Original"><FiDownload /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">Nenhum registro encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-view">
            <div className="info-banner warning">
              <FiAlertCircle />
              <div>
                <strong>Atenção ao Cegamento:</strong> Utilize apenas os códigos cegos atribuídos ao seu laboratório. 
                Qualquer quebra de cegamento deve ser reportada imediatamente como Ocorrência.
              </div>
            </div>
            
            <div className="inventory-grid">
              <div className="modern-card">
                <h4>Amostras Recebidas</h4>
                <div className="sample-list">
                  {(process.blindAssignments || [])
                    .filter(ba => ba.labEmail === user.email)
                    .map(ba => (
                      <div key={ba.id} className="sample-item">
                        <div className="sample-code">{ba.blindCode}</div>
                        <div className="sample-status">{ba.status}</div>
                        <div className="sample-meta">Recebido em: {ba.receivedAt || 'N/A'}</div>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="modern-card">
                <h4>Ocorrências Registradas</h4>
                <div className="occurrence-list">
                  {(process.occurrences || [])
                    .filter(occ => occ.reportedBy === user.name)
                    .map(occ => (
                      <div key={occ.id} className="occurrence-item">
                        <div className="occ-type">{occ.type}</div>
                        <p className="occ-desc">{occ.description}</p>
                        <div className="occ-meta">{new Date(occ.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  <button className="btn btn-outline-danger btn-block mt-3">
                    Registrar Novo Desvio/Ocorrência
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="upload-overlay">
          <div className="upload-modal">
            <FiRefreshCw className="spin large" />
            <h4>Processando Planilha...</h4>
            <p>O sistema está executando validações estruturais, sintáticas e semânticas.</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <div className="completion-status">
          <FiInfo />
          <span>
            {sheets.filter(s => s.required).every(s => getLatestSubmission(s.id)?.status === 'VALIDATED') 
              ? 'Todos os requisitos obrigatórios foram validados.' 
              : 'Pendente: Preencha e valide todos os templates obrigatórios para concluir a etapa.'}
          </span>
        </div>
        <button 
          className="btn btn-success btn-lg"
          disabled={!sheets.filter(s => s.required).every(s => getLatestSubmission(s.id)?.status === 'VALIDATED')}
        >
          Finalizar Execução Experimental
        </button>
      </footer>
    </div>
  );
};

export default LabDashboard;
