import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import { FIELD_TYPES, UNITS, SYSTEM_FIELDS } from '../../../../../modules/protocolDefinition/store/protocolDefinitionMock';

const ColumnEditor = ({ sheetId, columnId }) => {
  const { sheets, updateColumn } = useProtocolDefinitionStore();

  const sheet = sheets.find(s => s.id === sheetId);
  const column = sheet?.columns.find(c => c.id === columnId);

  if (!column) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    // Auto-setup if blind_code is selected
    if (name === 'fieldType' && value === 'blind_code') {
      updateColumn(sheetId, columnId, { 
        fieldType: 'blind_code',
        code: SYSTEM_FIELDS.SUBSTANCE_CODE,
        name: 'Identificador da Substância',
        required: true,
        isLocked: true 
      });
      return;
    }

    updateColumn(sheetId, columnId, { [name]: finalValue });
  };

  return (
    <div className="column-editor">
      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Configuração da Coluna</h3>
          {column.code === SYSTEM_FIELDS.SUBSTANCE_CODE && (
            <span className="badge-type" style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}>
              ⚙️ Campo Automático do Sistema
            </span>
          )}
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Nome da Coluna</label>
            <input type="text" name="name" value={column.name} onChange={handleChange} placeholder="Ex: Absorbância" />
          </div>
          <div className="form-group">
            <label>Código Interno (Import/Export)</label>
            <input 
              type="text" 
              name="code" 
              value={column.code} 
              onChange={handleChange} 
              placeholder="Ex: absorbancia_od"
              disabled={column.code === SYSTEM_FIELDS.SUBSTANCE_CODE}
            />
          </div>
          <div className="form-group">
            <label>Tipo do Campo</label>
            <select name="fieldType" value={column.fieldType} onChange={handleChange}>
              {FIELD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Unidade de Medida</label>
            <select name="unit" value={column.unit} onChange={handleChange} disabled={column.fieldType === 'blind_code'}>
              <option value="">Nenhuma</option>
              {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </div>

        {column.fieldType === 'blind_code' && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#fff7e6', borderRadius: '6px', border: '1px solid #ffd591', fontSize: '13px' }}>
            <strong>Nota do Sistema:</strong> Este campo será preenchido automaticamente com os identificadores cegos gerados na Etapa de Seleção de Substâncias quando o laboratório acessar a planilha.
          </div>
        )}

        <div className="form-grid" style={{ marginTop: '20px' }}>
          {(column.fieldType === 'decimal' || column.fieldType === 'integer' || column.fieldType === 'percentage') && (
            <>
              <div className="form-group">
                <label>Valor Mínimo</label>
                <input type="number" name="minValue" value={column.minValue || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Valor Máximo</label>
                <input type="number" name="maxValue" value={column.maxValue || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Casas Decimais</label>
                <input type="number" name="decimalPlaces" value={column.decimalPlaces} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Valor Padrão</label>
            <input type="text" name="defaultValue" value={column.defaultValue} onChange={handleChange} />
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: '20px' }}>
          <div className="form-group checkbox-group">
            <input type="checkbox" name="required" checked={column.required} onChange={handleChange} id="col-req" />
            <label htmlFor="col-req">Obrigatório?</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" name="allowMultiple" checked={column.allowMultiple} onChange={handleChange} id="col-mult" />
            <label htmlFor="col-mult">Aceita múltiplos valores?</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" name="isLocked" checked={column.isLocked} onChange={handleChange} id="col-lock" />
            <label htmlFor="col-lock">Bloqueado para laboratório?</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" name="isDerived" checked={column.isDerived} onChange={handleChange} id="col-calc" />
            <label htmlFor="col-calc">Campo derivado/calculado?</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" name="allowObservation" checked={column.allowObservation} onChange={handleChange} id="col-obs" />
            <label htmlFor="col-obs">Permitir observação vinculada?</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnEditor;
