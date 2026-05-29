import React from 'react';
import useProtocolDefinitionStore from '../../../../../modules/protocolDefinition/store/protocolDefinitionStore';

const ValidationRulesStep = () => {
  const { sheets } = useProtocolDefinitionStore();

  return (
    <div className="validation-rules-step">
      <div className="form-section">
        <h3>Regras de Validação Estrutural</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          O sistema aplica validações automáticas baseadas na estrutura configurada. 
          Abaixo estão as regras globais que serão aplicadas durante a importação.
        </p>
        
        <div className="list-items" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
          <div className="list-item">
            <span><strong>Estrutura Fixa de Colunas:</strong> Bloqueia renomeação ou remoção de colunas pelos laboratórios.</span>
            <span className="badge-type">Ativo</span>
          </div>
          <div className="list-item">
            <span><strong>Validação de Tipos:</strong> Garante que dados textuais não sejam inseridos em campos numéricos.</span>
            <span className="badge-type">Ativo</span>
          </div>
          <div className="list-item">
            <span><strong>Validação de Unidades:</strong> Verifica se os valores respeitam as unidades científicas configuradas.</span>
            <span className="badge-type">Ativo</span>
          </div>
          <div className="list-item">
            <span><strong>Obrigatoriedade:</strong> Impede a submissão de planilhas com campos obrigatórios vazios.</span>
            <span className="badge-type">Ativo</span>
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginTop: '32px' }}>
        <h3>Resumo de Faixas por Planilha</h3>
        {sheets.map(sheet => (
          <div key={sheet.id} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>{sheet.name}</h4>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '8px' }}>Coluna</th>
                  <th style={{ padding: '8px' }}>Tipo</th>
                  <th style={{ padding: '8px' }}>Faixa Válida</th>
                  <th style={{ padding: '8px' }}>Obrigatório</th>
                </tr>
              </thead>
              <tbody>
                {sheet.columns.map(col => (
                  <tr key={col.id} style={{ borderBottom: '1px solid #fafafa' }}>
                    <td style={{ padding: '8px' }}>{col.name}</td>
                    <td style={{ padding: '8px' }}>{col.fieldType}</td>
                    <td style={{ padding: '8px' }}>
                      {(col.minValue !== null || col.maxValue !== null) 
                        ? `${col.minValue || '-∞'} a ${col.maxValue || '+∞'} ${col.unit || ''}` 
                        : 'Livre'}
                    </td>
                    <td style={{ padding: '8px' }}>{col.required ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
                {sheet.columns.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#999' }}>Nenhuma coluna configurada nesta planilha</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationRulesStep;
