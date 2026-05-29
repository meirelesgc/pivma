import React from 'react';

const ExportSettingsStep = () => {
  return (
    <div className="export-settings-step">
      <div className="form-section">
        <h3>Configuração de Exportação do Template</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
          Defina como os arquivos XLSX serão gerados para os laboratórios.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label>Formato Principal</label>
            <select disabled>
              <option>Excel (.xlsx)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Formato Opcional</label>
            <select>
              <option value="none">Nenhum</option>
              <option value="csv">CSV (Delimitado por vírgula)</option>
            </select>
          </div>
        </div>

        <div className="form-section" style={{ marginTop: '32px' }}>
          <h3>Recursos de Segurança e Controle</h3>
          <div className="list-items" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
            <div className="list-item checkbox-group">
              <input type="checkbox" checked readOnly id="ex-instr" />
              <label htmlFor="ex-instr"><strong>Aba de Instruções Automática:</strong> Inclui aba explicativa com regras de preenchimento.</label>
            </div>
            <div className="list-item checkbox-group">
              <input type="checkbox" checked readOnly id="ex-valid" />
              <label htmlFor="ex-valid"><strong>Validação Nativa Excel:</strong> Aplica restrições de dados (Data Validation) nas células.</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSettingsStep;
