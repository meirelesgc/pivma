export const SYSTEM_FIELDS = {
  SUBSTANCE_CODE: '__SYSTEM_SUBSTANCE_CODE__'
};

export const MOCK_ENDPOINTS = [
  { id: 'ep-001', name: 'Viabilidade Celular (%)' },
  { id: 'ep-002', name: 'Absorbância (OD)' },
  { id: 'ep-003', name: 'Potencial de Irritação' },
  { id: 'ep-004', name: 'Concentração Inibitória (IC50)' }
];

export const METHOD_TYPES = [
  { id: 'cell_culture', label: 'Cultivo Celular' },
  { id: 'chemical_method', label: 'Método Químico' },
  { id: 'embryonated_egg', label: 'Ovo Embrionado' },
  { id: 'analytical_equipment', label: 'Equipamento Analítico' },
  { id: 'microscopy', label: 'Microscopia' },
  { id: 'other', label: 'Outro' }
];

export const SHEET_TYPES = [
  { id: 'sample_receipt', label: 'Recebimento de Amostra' },
  { id: 'substance_receipt', label: 'Recebimento de Substância' },
  { id: 'raw_data', label: 'Dados Brutos' },
  { id: 'final_result', label: 'Resultado Final' },
  { id: 'transport_control', label: 'Controle de Transporte' },
  { id: 'custom', label: 'Customizada' }
];

export const FIELD_TYPES = [
  { id: 'short_text', label: 'Texto Curto' },
  { id: 'long_text', label: 'Texto Longo' },
  { id: 'decimal', label: 'Número Decimal' },
  { id: 'integer', label: 'Número Inteiro' },
  { id: 'percentage', label: 'Percentual' },
  { id: 'datetime', label: 'Data/Hora' },
  { id: 'boolean', label: 'Booleano' },
  { id: 'blind_code', label: 'Código Cego' },
];

export const UNITS = [
  { id: 'pct', label: '%' },
  { id: 'mg_kg', label: 'mg/kg' },
  { id: 'mg_ml', label: 'mg/ml' },
  { id: 'celsius', label: '°C' },
  { id: 'ph', label: 'pH' },
  { id: 'nm', label: 'nm' },
  { id: 'od', label: 'OD' },
  { id: 'ul', label: 'μL' },
  { id: 'custom', label: 'Customizada' }
];

export const INITIAL_PROTOCOL_STATE = {
  protocol: {
    id: '',
    name: '',
    code: '',
    endpointId: '',
    methodType: '',
    version: '1.0',
    description: '',
    expectedSubstances: 0,
    allowAttachments: false,
    status: 'draft'
  },
  sheets: []
};
