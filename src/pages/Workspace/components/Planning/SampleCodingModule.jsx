import { useState } from 'react'
import useMockStore from '../../../../store/useMockStore'

const SampleCodingModule = ({ process, demand, onComplete }) => {
  const { generateBlindCodes, saveDemandDraft } = useMockStore()
  
  const [samples, setSamples] = useState(process.samples?.length > 0 ? process.samples : [
    { id: 's1', internalName: '', batch: '', notes: '' }
  ])

  const handleAddSample = () => {
    setSamples([...samples, { id: `s${samples.length + 1}`, internalName: '', batch: '', notes: '' }])
  }

  const handleUpdateSample = (index, field, value) => {
    const newSamples = [...samples]
    newSamples[index][field] = value
    setSamples(newSamples)
  }

  const handleSaveDraft = () => {
    saveDemandDraft(process.id, demand.id, { samples })
    alert('Rascunho do plano de amostras salvo.')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const labs = (process.participants || []).filter(part => part.role === 'LABORATORIO_PARTICIPANTE')
    
    if (labs.length === 0) {
      alert('Atenção: Não há laboratórios participantes designados para este método. Atribua os laboratórios antes de gerar os códigos cegos.')
      return
    }

    if (samples.some(s => !s.internalName || !s.batch)) {
      alert('Por favor, preencha o nome e o lote de todas as substâncias.')
      return
    }

    generateBlindCodes(process.id, demand.id, samples)
    if (onComplete) onComplete()
  }

  return (
    <div className="sample-coding-module">
      <p className="text-small text-secondary" style={{ marginBottom: '20px' }}>
        Cadastre as substâncias de teste. O sistema gerará automaticamente códigos cegos únicos para cada laboratório participante.
      </p>

      <form className="planning-form" onSubmit={handleSubmit}>
        <div className="samples-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {samples.map((sample, index) => (
            <div key={sample.id} className="sample-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Interno (Real)</label>
                  <input 
                    type="text" 
                    value={sample.internalName} 
                    onChange={(e) => handleUpdateSample(index, 'internalName', e.target.value)}
                    placeholder="Ex: Ácido Hialurônico 5%"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lote / Identificador</label>
                  <input 
                    type="text" 
                    value={sample.batch} 
                    onChange={(e) => handleUpdateSample(index, 'batch', e.target.value)}
                    placeholder="Ex: LOT-2026-X8"
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Observações de Segurança / Manuseio</label>
                <textarea 
                  value={sample.notes} 
                  onChange={(e) => handleUpdateSample(index, 'notes', e.target.value)}
                  placeholder="Instruções específicas para o Grupo de Amostras..."
                  rows="2"
                />
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="action-link" onClick={handleAddSample} style={{ marginTop: '12px' }}>
          + Adicionar Substância
        </button>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
          <button type="button" className="action-link" onClick={handleSaveDraft}>
            Salvar Rascunho
          </button>
          <button type="submit" className="btn btn-primary">
            Gerar Códigos e Consolidar Matriz
          </button>
        </div>
      </form>
    </div>
  )
}

export default SampleCodingModule
