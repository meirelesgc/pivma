import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'

const ExperimentalSubmissionForm = ({ process, demand, onComplete }) => {
  const { saveDemandDraft, submitDemandForValidation, user } = useMockStore()
  
  // Get blind codes for this specific lab
  const labAssignments = (process.blindAssignments || []).filter(a => a.labEmail === user?.email);

  const [formData, setFormData] = useState(demand.consolidationData || {
    notes: '',
    files: [],
    selectedBlindCode: ''
  })

  const handleMockUpload = () => {
    if (!formData.selectedBlindCode) {
      alert('Selecione primeiro a Amostra Cega para a qual deseja realizar o upload.');
      return;
    }
    const fileName = `dataset_${formData.selectedBlindCode}_${Math.floor(Math.random() * 1000)}.csv`
    const newFiles = [...formData.files, { 
      name: fileName, 
      blindCode: formData.selectedBlindCode,
      size: '2.4 MB', 
      uploadedAt: new Date().toISOString() 
    }]
    setFormData({ ...formData, files: newFiles })
  }

  const removeFile = (index) => {
    const newFiles = [...formData.files]
    newFiles.splice(index, 1)
    setFormData({ ...formData, files: newFiles })
  }

  const handleSaveDraft = () => {
    saveDemandDraft(process.id, demand.id, formData)
    alert('Rascunho de submissão salvo!')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.files.length === 0) {
      alert('Por favor, anexe ao menos um arquivo de registro experimental.')
      return
    }

    submitDemandForValidation(process.id, demand.id, {
      ...formData,
      submittedBy: user?.name,
      submittedAt: new Date().toISOString()
    })

    if (onComplete) onComplete()
    alert('Registros enviados para validação do Grupo Gestor!')
  }

  return (
    <form className="experimental-form" onSubmit={handleSubmit}>
      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label>Amostra Cega (ID)</label>
        <select 
          value={formData.selectedBlindCode} 
          onChange={(e) => setFormData({ ...formData, selectedBlindCode: e.target.value })}
          required
        >
          <option value="">Selecione o código da amostra...</option>
          {labAssignments.map(a => (
            <option key={a.blindCode} value={a.blindCode}>{a.blindCode}</option>
          ))}
          {labAssignments.length === 0 && (
            <option disabled>Nenhum código cego atribuído ainda.</option>
          )}
        </select>
        <p className="text-smaller text-tertiary" style={{ marginTop: '4px' }}>
          O Grupo de Amostras ainda não consolidou o plano de cegamento para este laboratório.
        </p>
      </div>

      <div className="upload-section">
        <label>Arquivos de Registros (Dados Brutos / Planilhas)</label>
        <div className="upload-zone-mock" onClick={handleMockUpload}>
          <div className="upload-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <p className="text-small">Clique para simular upload para <strong>{formData.selectedBlindCode || '...'}</strong></p>
          <p className="text-smaller text-tertiary">Formatos aceitos conforme protocolo</p>
        </div>

        {formData.files.length > 0 && (
          <div className="file-list-mock">
            {formData.files.map((file, index) => (
              <div key={index} className="file-item-mock">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  <span>{file.name}</span>
                  <span className="badge-status in-progress" style={{ fontSize: '8px' }}>{file.blindCode}</span>
                  <span className="text-smaller text-tertiary">({file.size})</span>
                </div>
                <div className="btn-remove-file" onClick={() => removeFile(index)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Observações Técnicas / Notas de Execução</label>
        <textarea 
          value={formData.notes} 
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Descreva eventuais desvios ou observações relevantes sobre esta rodada experimental..."
          rows="4"
        />
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="action-link" onClick={handleSaveDraft}>
          Salvar Rascunho
        </button>
        <button type="submit" className="btn btn-primary" style={{ background: '#009c3b' }}>
          Enviar para Validação
        </button>
      </div>
    </form>
  )
}

export default ExperimentalSubmissionForm
