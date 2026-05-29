import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import { SHEET_TYPES } from '../../../../../modules/protocolDefinition/store/protocolDefinitionMock';

const SpreadsheetConfigStep = () => {
  const { sheets, addSheet, updateSheet, removeSheet, selectedSheetId, setSelectedSheet } = useProtocolDefinitionStore();

  const selectedSheet = sheets.find(s => s.id === selectedSheetId);

  const handleUpdate = (e) => {
    const { name, value, type, checked } = e.target;
    updateSheet(selectedSheetId, { [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="editor-layout">
      <div className="sidebar-list">
        <div className="sidebar-header">
          <span>Planilhas ({sheets.length})</span>
          <button className="btn-add" onClick={() => addSheet()}>+ Adicionar</button>
        </div>
        <div className="list-items">
          {sheets.length === 0 && <div className="empty-state">Nenhuma planilha criada</div>}
          {sheets.map(sheet => (
            <div 
              key={sheet.id} 
              className={`list-item ${selectedSheetId === sheet.id ? 'selected' : ''}`}
              onClick={() => setSelectedSheet(sheet.id)}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{sheet.name}</span>
                <span className="badge-type">{SHEET_TYPES.find(t => t.id === sheet.type)?.label}</span>
              </div>
              <button className="btn-delete" onClick={(e) => { e.stopPropagation(); removeSheet(sheet.id); }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="editor-main">
        {selectedSheet ? (
          <div className="sheet-form">
            <div className="form-section">
              <h3>Configurações da Planilha</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome da Planilha</label>
                  <input type="text" name="name" value={selectedSheet.name} onChange={handleUpdate} />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select name="type" value={selectedSheet.type} onChange={handleUpdate}>
                    {SHEET_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Controle de Linhas</label>
                  <select name="rowCountType" value={selectedSheet.rowCountType} onChange={handleUpdate}>
                    <option value="substances">Baseado em Substâncias</option>
                    <option value="fixed">Quantidade Fixa</option>
                    <option value="multiple">Múltiplas por Substância</option>
                  </select>
                </div>
                {selectedSheet.rowCountType === 'fixed' && (
                  <div className="form-group">
                    <label>Qtd. de Linhas</label>
                    <input type="number" name="fixedRowCount" value={selectedSheet.fixedRowCount} onChange={handleUpdate} />
                  </div>
                )}
              </div>

              <div className="form-grid" style={{ marginTop: '20px' }}>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="required" checked={selectedSheet.required} onChange={handleUpdate} id="sh-req" />
                  <label htmlFor="sh-req">Obrigatória</label>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="allowRepetitions" checked={selectedSheet.allowRepetitions} onChange={handleUpdate} id="sh-rep" />
                  <label htmlFor="sh-rep">Permitir repetição de registros?</label>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="blindLinked" checked={selectedSheet.blindLinked} onChange={handleUpdate} id="sh-blind" />
                  <label htmlFor="sh-blind">Vincular a Substâncias Cegadas?</label>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="allowSheetAttachments" checked={selectedSheet.allowSheetAttachments} onChange={handleUpdate} id="sh-att" />
                  <label htmlFor="sh-att">Permitir upload de anexos?</label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">Selecione ou adicione uma planilha para configurar</div>
        )}
      </div>
    </div>
  );
};

export default SpreadsheetConfigStep;
