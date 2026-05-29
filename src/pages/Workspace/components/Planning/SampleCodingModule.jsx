import { useState, useMemo } from 'react'
import useMockStore from '../../../../store/useMockStore'

const SampleCodingModule = ({ process, demand, onComplete }) => {
  const {
    setEndpoint,
    updateSamples,
    generateBlindCodes,
    registerShipment,
    confirmReceipt,
    registerOccurrence,
    saveDemandDraft,
    consolidateDemand
  } = useMockStore()

  const [activePhase, setActivePhase] = useState(1)
  const [selectedLabel, setSelectedLabel] = useState(null)

  const [endpointInput, setEndpointInput] = useState(process.endpoint?.target || '')
  const [samples, setSamples] = useState(process.samples?.length > 0 ? process.samples : [])
  const [newSample, setNewSample] = useState({
    id: '',
    internalName: '',
    cas: '',
    category: 'non-reactive',
    reference: '',
    doi: '',
    isChallenge: false,
    challengeJustification: '',
    status: 'draft'
  })

  const [shipmentForm, setShipmentForm] = useState({
    labEmail: '',
    trackingNumber: '',
    checklist: {}
  })
  const handlePrintLabel = (label) => {
    const printWindow = window.open('', '_blank');
    const imageUrl = `${window.location.origin}/qrcode.png`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta ${label.blindCode}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .label-canvas { border: 2px solid #000; padding: 20px; width: 300px; text-align: center; }
            .label-header { font-size: 12px; font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
            .label-lab-name { font-size: 14px; font-weight: 600; }
            .label-text-small { font-size: 10px; text-transform: uppercase; color: #666; }
            .label-qrcode { width: 150px; height: 150px; margin: 15px 0; }
            .label-code { font-size: 28px; font-weight: 800; }
            .label-footer { font-size: 10px; font-weight: 700; border-top: 1px solid #000; padding-top: 5px; margin-top: 15px; color: #cc0000; }
          </style>
        </head>
        <body>
          <div class="label-canvas">
            <div class="label-header">BraCVAM - Pi*VMA</div>
            <div class="label-text-small">Destino:</div>
            <div class="label-lab-name">${label.labName}</div>
            <img src="${imageUrl}" class="label-qrcode" onload="triggerPrint()" />
            <div class="label-code">${label.blindCode}</div>
            <div class="label-footer">Sigilo Científico - Não Abrir</div>
          </div>
          <script>
            function triggerPrint() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const labs = useMemo(() =>
    (process.participants || []).filter(p => p.role === 'LABORATORIO_PARTICIPANTE'),
    [process.participants]
  )

  const allReceived = useMemo(() =>
    process.blindAssignments?.length > 0 &&
    process.blindAssignments.every(ba => ba.status === 'RECEIVED'),
    [process.blindAssignments]
  )

  const isModuleFrozen = allReceived || (process.currentState !== 'PLANEJAMENTO' && process.currentState !== 'PREPARACAO')

  const handleAddSample = () => {
    if (isModuleFrozen) return
    if (!newSample.internalName || !newSample.cas) return
    const s = { ...newSample, id: Math.random().toString(36).substr(2, 9), status: 'confirmed' }
    const updated = [...samples, s]
    setSamples(updated)
    updateSamples(process.id, updated)
    setNewSample({ id: '', internalName: '', cas: '', category: 'non-reactive', reference: '', doi: '', isChallenge: false, challengeJustification: '', status: 'draft' })
  }

  const coverage = useMemo(() => {
    const counts = { 'non-reactive': 0, 'slight': 0, 'moderate': 0, 'severe': 0 }
    samples.forEach(s => counts[s.category]++)
    return counts
  }, [samples])

  const allCategoriesCovered = Object.values(coverage).every(count => count > 0)

  const handleGenerateCodes = () => {
    if (samples.length === 0) return alert('Selecione ao menos uma substância.')
    if (labs.length === 0) return alert('Nenhum laboratório participante designado.')
    generateBlindCodes(process.id, demand.id, samples)
  }

  const renderPhase1 = () => (
    <div className="phase-container fadeIn">
      <div className="alert-banner technical">
        <div className="banner-icon">ℹ</div>
        <div className="banner-content">
          <strong>Endpoint Ativo:</strong> {process.endpoint?.isLocked ? (
            <span>{process.endpoint.target} (Bloqueado)</span>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                className="input-technical"
                disabled={isModuleFrozen}
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="Ex: Irritação dérmica"
              />
              {!isModuleFrozen && <button className="btn btn-tiny btn-primary" onClick={() => setEndpoint(process.id, endpointInput)}>Registrar Endpoint</button>}
            </div>
          )}
        </div>
      </div>

      {isModuleFrozen && (
        <div className="alert-banner technical frozen" style={{ background: '#fff1f0', borderColor: '#ffa39e', marginBottom: '16px' }}>
          <div className="banner-icon" style={{ background: '#f5222d' }}>🔒</div>
          <div className="banner-content">
            <strong>Módulo Congelado:</strong> O estudo está em execução. Alterações na seleção ou codificação estão bloqueadas para garantir a integridade do teste cego.
          </div>
        </div>
      )}

      <div className="two-col-grid" style={{ marginTop: '24px' }}>
        <div className="selection-form">
          <h4 className="section-title">Adicionar Substância</h4>
          <div className="modern-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Interno</label>
                <input type="text" disabled={isModuleFrozen} value={newSample.internalName} onChange={e => setNewSample({ ...newSample, internalName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Número CAS</label>
                <input type="text" disabled={isModuleFrozen} value={newSample.cas} onChange={e => setNewSample({ ...newSample, cas: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Categoria de Reatividade</label>
                <select disabled={isModuleFrozen} value={newSample.category} onChange={e => setNewSample({ ...newSample, category: e.target.value })}>
                  <option value="non-reactive">Não reativo</option>
                  <option value="slight">Levemente reativo</option>
                  <option value="moderate">Moderadamente reativo</option>
                  <option value="severe">Severamente reativo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Referência Bibliográfica</label>
                <input type="text" disabled={isModuleFrozen} value={newSample.reference} onChange={e => setNewSample({ ...newSample, reference: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isModuleFrozen}
                  checked={newSample.isChallenge}
                  onChange={e => setNewSample({ ...newSample, isChallenge: e.target.checked })}
                />
                <span>Substância Desafiadora</span>
              </label>
              {newSample.isChallenge && (
                <textarea
                  className="textarea-technical"
                  disabled={isModuleFrozen}
                  placeholder="Justificativa do desafio..."
                  value={newSample.challengeJustification}
                  onChange={e => setNewSample({ ...newSample, challengeJustification: e.target.value })}
                />
              )}
            </div>
            {!isModuleFrozen && <button className="btn btn-primary btn-full" style={{ marginTop: '16px' }} onClick={handleAddSample}>Adicionar à Lista</button>}
          </div>
        </div>

        <div className="coverage-panel">
          <h4 className="section-title">Cobertura do Espectro</h4>
          <div className="modern-card">
            {Object.entries(coverage).map(([cat, count]) => (
              <div key={cat} className="coverage-item">
                <div className="coverage-label">
                  <span>{cat.replace('-', ' ')}</span>
                  <span>{count}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className={`progress-bar-fill ${count > 0 ? 'bg-success' : 'bg-empty'}`} style={{ width: count > 0 ? '100%' : '5%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 className="section-title">Substâncias Selecionadas</h4>
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Substância</th>
              <th>CAS</th>
              <th>Categoria</th>
              <th>Desafio</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {samples.map(s => (
              <tr key={s.id}>
                <td>{s.internalName}</td>
                <td>{s.cas}</td>
                <td><span className={`badge-technical ${s.category}`}>{s.category}</span></td>
                <td>{s.isChallenge ? 'Sim' : 'Não'}</td>
                <td><button className="text-danger" onClick={() => setSamples(samples.filter(x => x.id !== s.id))}>Remover</button></td>
              </tr>
            ))}
            {samples.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>Nenhuma substância adicionada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPhase2 = () => (
    <div className="phase-container fadeIn">
      <div className="action-header">
        <div>
          <h4 className="section-title">Matriz de Codificação Cega</h4>
          <p className="text-secondary">Geração de códigos únicos e irrepetíveis por laboratório.</p>
        </div>
        {!process.blindAssignments?.length && (
          <button className="btn btn-primary" onClick={handleGenerateCodes}>Gerar Matriz de Cegamento</button>
        )}
      </div>

      {process.blindAssignments?.length > 0 ? (
        <div className="matrix-scroll-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Substância Real</th>
                {labs.map(l => <th key={l.email}>{l.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {samples.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.internalName}</td>
                  {labs.map(l => {
                    const ba = process.blindAssignments.find(x => x.sampleId === s.id && x.labEmail === l.email)
                    return <td key={l.email} className="blind-code-cell">{ba?.blindCode}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="info-box-light" style={{ marginTop: '16px' }}>
            <p><strong>Segurança:</strong> O gabarito acima é restrito ao Grupo de Seleção. Laboratórios visualizam apenas seus próprios códigos.</p>
          </div>
        </div>
      ) : (
        <div className="empty-workspace-state" style={{ padding: '40px' }}>
          <p className="text-secondary">Aguardando geração da matriz.</p>
        </div>
      )}
    </div>
  )

  const renderPhase3 = () => (
    <div className="phase-container fadeIn">
      <h4 className="section-title">Logística e Distribuição</h4>
      <div className="two-col-grid">
        <div className="shipment-form">
          <div className="modern-card">
            <h5>Preparar Envio</h5>
            <div className="form-group">
              <label>Laboratório de Destino</label>
              <select
                value={shipmentForm.labEmail}
                onChange={e => setShipmentForm({ ...shipmentForm, labEmail: e.target.value })}
              >
                <option value="">Selecione...</option>
                {labs.map(l => <option key={l.email} value={l.email}>{l.name}</option>)}
              </select>
            </div>

            {shipmentForm.labEmail && (
              <div className="checklist-container" style={{ marginTop: '16px' }}>
                <h6>Checklist de Frascos</h6>

                <table className="matrix-table" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', padding: '12px' }}></th>
                      <th style={{ padding: '12px' }}>Código da Amostra</th>
                      <th style={{ padding: '12px' }}>Requisito</th>
                      <th style={{ padding: '12px' }}>Etiqueta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.blindAssignments
                      .filter(ba => ba.labEmail === shipmentForm.labEmail)
                      .map(ba => (
                        <tr key={ba.id}>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="checkbox"
                              style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                              checked={shipmentForm.checklist[ba.id] || false}
                              onChange={e => setShipmentForm({
                                ...shipmentForm,
                                checklist: { ...shipmentForm.checklist, [ba.id]: e.target.checked }
                              })}
                            />
                          </td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{ba.blindCode}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Confirmar Lacre</td>
                          <td style={{ padding: '12px' }}>
                            <button
                              className="btn btn-tiny btn-secondary"
                              onClick={() => setSelectedLabel(ba)}
                            >
                              Gerar Etiqueta
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Número de Rastreio</label>
                  <input
                    type="text"
                    value={shipmentForm.trackingNumber}
                    onChange={e => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })}
                  />
                </div>
                <button
                  className="btn btn-success btn-full"
                  style={{ marginTop: '12px' }}
                  disabled={!shipmentForm.trackingNumber || Object.values(shipmentForm.checklist).filter(v => v).length !== samples.length}
                  onClick={() => {
                    registerShipment(process.id, shipmentForm.labEmail, shipmentForm.trackingNumber, [])
                    setShipmentForm({ labEmail: '', trackingNumber: '', checklist: {} })
                  }}
                >
                  Confirmar Envio e Gerar Termo
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="shipment-history">
          <h5>Envios Realizados</h5>
          <div className="shipment-list">
            {(process.shipments || []).map(s => (
              <div key={s.id} className="shipment-card-mini">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{labs.find(l => l.email === s.labEmail)?.name}</span>
                  <span className={`badge-status ${s.status === 'RECEIVED' ? 'bg-success' : 'bg-warning'}`}>{s.status}</span>
                </div>
                <div className="text-smaller text-tertiary">Rastreio: {s.trackingNumber}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPhase4 = () => (
    <div className="phase-container fadeIn">
      <h4 className="section-title">Ocorrências e Emergências</h4>
      <div className="modern-card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="stat-card">
            <span className="stat-label">Envelopes SDS Abertos</span>
            <span className="stat-value">{(process.occurrences || []).filter(o => o.type === 'SDS_OPEN').length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Amostras Perdidas</span>
            <span className="stat-value">{(process.occurrences || []).filter(o => o.type === 'LOSS').length}</span>
          </div>
        </div>

        <table className="matrix-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Amostra (Código)</th>
              <th>Lab</th>
              <th>Relatado por</th>
            </tr>
          </thead>
          <tbody>
            {(process.occurrences || []).map(o => (
              <tr key={o.id}>
                <td>{new Date(o.timestamp).toLocaleDateString()}</td>
                <td><span className="text-danger">{o.type}</span></td>
                <td>{o.blindCode}</td>
                <td>{o.labName}</td>
                <td>{o.reportedBy}</td>
              </tr>
            ))}
            {(!process.occurrences || process.occurrences.length === 0) && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>Nenhuma ocorrência registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPhase5 = () => (
    <div className="phase-container fadeIn">
      <div className="empty-workspace-state">
        <div className="empty-icon" style={{ background: '#e1f5fe', color: '#0288d1' }}>📋</div>
        <h3>Relatório de Auditoria de Amostras</h3>
        <p className="text-secondary">Módulo finalizado e pronto para auditoria BraCVAM.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <button className="btn btn-secondary">
            <svg width="16" height="16" style={{ marginRight: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar Dossiê de Codificação (PDF)
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => consolidateDemand(process.id, demand.id)}
          >
            Finalizar Etapa de Codificação
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="sample-coding-workspace">
      <div className="phase-stepper">
        {[
          { id: 1, label: 'Seleção' },
          { id: 2, label: 'Codificação' },
          { id: 3, label: 'Distribuição' },
          { id: 4, label: 'Ocorrências' },
          { id: 5, label: 'Auditoria' }
        ].map(p => (
          <div key={p.id} className={`phase-tab ${activePhase === p.id ? 'active' : ''}`} onClick={() => setActivePhase(p.id)}>
            <span className="phase-num">{p.id}</span>
            <span className="phase-label">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="phase-content">
        {activePhase === 1 && renderPhase1()}
        {activePhase === 2 && renderPhase2()}
        {activePhase === 3 && renderPhase3()}
        {activePhase === 4 && renderPhase4()}
        {activePhase === 5 && renderPhase5()}
      </div>

      {selectedLabel && (
        <div className="modal-overlay">
          <div className="modern-card modal-content label-preview-modal">
            <div className="modal-header">
              <h4>Prévia da Etiqueta</h4>
              <button className="btn-close" onClick={() => setSelectedLabel(null)}>×</button>
            </div>

            <div className="label-preview-body">
              <div className="label-canvas">
                <div className="label-header">BraCVAM - Pi*VMA</div>
                <div className="label-text-small">Destino:</div>
                <div className="label-lab-name">{selectedLabel.labName}</div>
                <img src={`${import.meta.env.BASE_URL}qrcode.png`} alt="QR Code" className="label-qrcode" />
                <div className="label-code">{selectedLabel.blindCode}</div>
                <div className="label-footer">Sigilo Científico - Não Abrir</div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedLabel(null)}>Fechar</button>
              <button className="btn btn-primary" onClick={() => handlePrintLabel(selectedLabel)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Imprimir / Baixar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .label-preview-modal { width: 400px; }
        .label-preview-body { background: #f0f0f0; padding: 40px; display: flex; justify-content: center; border-radius: 8px; }
        .label-canvas { 
          border: 2px solid #000; padding: 20px; width: 240px; 
          background: white; text-align: center; color: black;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .label-header { font-size: 10px; font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
        .label-lab-name { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
        .label-text-small { font-size: 9px; text-transform: uppercase; color: #666; }
        .label-qrcode { width: 120px; height: 120px; margin: 12px 0; }
        .label-code { font-size: 24px; font-weight: 800; }
        .label-footer { font-size: 9px; font-weight: 700; border-top: 1px solid #000; padding-top: 4px; margin-top: 12px; color: #cc0000; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 12px; }
        .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
        .btn-close:hover { color: #333; }

        .sample-coding-workspace { display: flex; flex-direction: column; gap: 24px; }
        .phase-stepper { display: flex; border-bottom: 1px solid var(--border-color); gap: 2px; }
        .phase-tab { 
          padding: 12px 24px; cursor: pointer; display: flex; align-items: center; gap: 10px;
          border-bottom: 3px solid transparent; transition: all 0.2s;
        }
        .phase-tab.active { border-bottom-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.02); }
        .phase-num { 
          width: 20px; height: 20px; border-radius: 50%; background: #eee; 
          display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
        }
        .phase-tab.active .phase-num { background: var(--primary-color); color: white; }
        .phase-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .phase-tab.active .phase-label { color: var(--primary-color); }

        .two-col-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
        .alert-banner.technical { 
          background: #f0f7ff; border: 1px solid #d0e7ff; border-radius: 8px; 
          padding: 16px; display: flex; gap: 16px; align-items: flex-start;
        }
        .banner-icon { font-weight: 700; background: #0288d1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        
        .coverage-item { margin-bottom: 12px; }
        .coverage-label { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; }
        .progress-bar-bg { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; transition: width 0.3s; }
        .bg-success { background: #009c3b; }
        .bg-empty { background: #eee; }

        .badge-technical { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
        .badge-technical.non-reactive { background: #e8f5e9; color: #2e7d32; }
        .badge-technical.slight { background: #fff3e0; color: #ef6c00; }
        .badge-technical.moderate { background: #fbe9e7; color: #d84315; }
        .badge-technical.severe { background: #ffebee; color: #c62828; }

        .blind-code-cell { font-family: 'Monaco', 'Consolas', monospace; font-weight: 700; color: var(--primary-color); background: #f8f9fa; }
        
        .stat-card { flex: 1; padding: 16px; background: #f8f9fa; border-radius: 8px; display: flex; flex-direction: column; }
        .stat-label { font-size: 10px; text-transform: uppercase; color: var(--text-tertiary); }
        .stat-value { font-size: 24px; font-weight: 700; color: var(--text-primary); }

        .shipment-card-mini { padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px; }
        .badge-status.bg-warning { background: #fff8e1; color: #f57f17; }
        
        .textarea-technical { width: 100%; min-height: 80px; margin-top: 8px; padding: 8px; font-size: 12px; border-radius: 4px; border: 1px solid var(--border-color); }
        .input-technical { padding: 4px 12px; border-radius: 4px; border: 1px solid var(--border-color); font-size: 13px; }
        .btn-full { width: 100%; }

        .matrix-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .matrix-table th { padding: 16px 12px; text-align: left; border-bottom: 2px solid #eee; font-size: 13px; color: var(--text-secondary); }
        .matrix-table td { padding: 16px 12px; border-bottom: 1px solid #eee; vertical-align: middle; font-size: 14px; }

.checkbox-label { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  cursor: pointer; 
  font-size: 14px; 
  line-height: 1;
}

.checkbox-label input { 
  margin: 0; 
  width: 16px;
  height: 16px;
}
  .action-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
      `}</style>
    </div>
  )
}

export default SampleCodingModule