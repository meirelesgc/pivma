import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import ColumnEditor from './ColumnEditor';
import { FIELD_TYPES } from '../../../../../modules/protocolDefinition/store/protocolDefinitionMock';

const SheetEditor = () => {
  const { sheets, selectedSheetId, setSelectedSheet, addColumn, removeColumn, selectedColumnId, setSelectedColumn } = useProtocolDefinitionStore();

  const selectedSheet = sheets.find(s => s.id === selectedSheetId);

  return (
    <div className="editor-layout">
      <div className="sidebar-list">
        <div className="sidebar-header" style={{ background: '#eef2ff' }}>
          <span>Planilha</span>
        </div>
        <select 
          className="form-group" 
          style={{ width: 'calc(100% - 24px)', margin: '12px', padding: '8px' }}
          value={selectedSheetId || ''} 
          onChange={(e) => setSelectedSheet(e.target.value)}
        >
          <option value="">Selecione a planilha...</option>
          {sheets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {selectedSheet && (
          <>
            <div className="sidebar-header">
              <span>Colunas ({selectedSheet.columns.length})</span>
              <button className="btn-add" onClick={() => addColumn(selectedSheetId)}>+ Add Coluna</button>
            </div>
            <div className="list-items">
              {selectedSheet.columns.length === 0 && <div className="empty-state">Nenhuma coluna</div>}
              {selectedSheet.columns.map(col => (
                <div 
                  key={col.id} 
                  className={`list-item ${selectedColumnId === col.id ? 'selected' : ''}`}
                  onClick={() => setSelectedColumn(col.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{col.name}</span>
                    <span className="badge-type">{FIELD_TYPES.find(t => t.id === col.fieldType)?.label}</span>
                  </div>
                  <button className="btn-delete" onClick={(e) => { e.stopPropagation(); removeColumn(selectedSheetId, col.id); }}>✕</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="editor-main">
        {selectedSheet && selectedColumnId ? (
          <ColumnEditor sheetId={selectedSheetId} columnId={selectedColumnId} />
        ) : (
          <div className="empty-state">
            {!selectedSheet ? 'Selecione uma planilha para editar suas colunas' : 'Selecione ou adicione uma coluna para configurar'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SheetEditor;
