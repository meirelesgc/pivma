import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';
import { SYSTEM_FIELDS } from '../../../../../modules/protocolDefinition/store/protocolDefinitionMock';

const TemplatePreview = () => {
  const { sheets } = useProtocolDefinitionStore();

  return (
    <div className="template-preview">
      <h3>Visualização Estrutural do Template</h3>
      {sheets.map(sheet => (
        <div key={sheet.id} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ padding: '4px 12px', background: '#333', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ABA</span>
            <h4 style={{ margin: 0 }}>{sheet.name}</h4>
          </div>
          
          <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  {sheet.columns.map(col => (
                    <th key={col.id} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left', minWidth: '150px' }}>
                      <div style={{ fontWeight: 'bold' }}>{col.name}</div>
                      <div style={{ fontSize: '10px', color: '#666', fontWeight: 'normal' }}>
                        {col.fieldType} {col.unit ? `(${col.unit})` : ''}
                        {col.required && <span style={{ color: 'red' }}> *</span>}
                      </div>
                    </th>
                  ))}
                  {sheet.columns.length === 0 && <th style={{ padding: '20px', color: '#999' }}>Nenhuma coluna configurada</th>}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i}>
                    {sheet.columns.map(col => (
                      <td key={col.id} style={{ 
                        border: '1px solid #ddd', 
                        padding: '10px', 
                        background: col.code === SYSTEM_FIELDS.SUBSTANCE_CODE ? '#f0f7ff' : '#fff', 
                        color: col.code === SYSTEM_FIELDS.SUBSTANCE_CODE ? '#0056b3' : '#ccc',
                        fontStyle: col.code === SYSTEM_FIELDS.SUBSTANCE_CODE ? 'italic' : 'normal'
                      }}>
                        {col.code === SYSTEM_FIELDS.SUBSTANCE_CODE ? `[AUTO: SUBST_00${i}]` : (col.defaultValue || '...')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {sheets.length === 0 && <div className="empty-state">Configure pelo menos uma planilha para ver o preview</div>}
    </div>
  );
};

export default TemplatePreview;
