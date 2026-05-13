import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('theme-light')
    } else {
      document.body.classList.remove('theme-light')
    }
  }, [isLight])

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-large">Design System Baseline - BraCVAM</h1>
          <p className="text-secondary weight-light">Padrões visuais com Verde Brasil e Inter Light.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => setIsLight(!isLight)}
        >
          Mudar para Tema {isLight ? 'Escuro' : 'Claro'}
        </button>
      </header>

      <div className="floating-card">
        <h2 className="text-medium" style={{ marginBottom: '16px' }}>Exemplo de Card Flutuante</h2>
        <p className="text-secondary" style={{ marginBottom: '24px' }}>
          Este card utiliza a sombra {isLight ? 'suave' : 'profunda'} e o arredondamento de 12px.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className="btn btn-primary">Botão Primário</button>
          <button className="btn btn-secondary">Botão Secundário</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="text-small weight-regular">Campo de Entrada</label>
          <input type="text" className="input-field" placeholder="Digite algo..." />
        </div>
      </div>

      <div className="surface-translucent" style={{ marginTop: '40px', padding: '24px', borderRadius: '12px' }}>
        <h3 className="text-medium">Superfície Translúcida</h3>
        <p className="text-secondary">Efeito de desfoque de fundo (backdrop-filter) e transparência otimizada para o tema.</p>
      </div>

      <table className="data-table" style={{ marginTop: '40px' }}>
        <thead>
          <tr>
            <th>Status</th>
            <th>Data</th>
            <th>Responsável</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Aprovado</td>
            <td>13/05/2026</td>
            <td>Dr. Meireles</td>
          </tr>
          <tr>
            <td>Pendente</td>
            <td>14/05/2026</td>
            <td>Eng. Gemini</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}