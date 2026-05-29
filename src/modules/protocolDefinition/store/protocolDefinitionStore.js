import { create } from 'zustand';
import { INITIAL_PROTOCOL_STATE } from './protocolDefinitionMock';

const useProtocolDefinitionStore = create((set) => ({
  ...INITIAL_PROTOCOL_STATE,
  activeStep: 0,
  selectedSheetId: null,
  selectedColumnId: null,

  // Basic Setters
  setProtocol: (data) => set((state) => ({ protocol: { ...state.protocol, ...data } })),
  setActiveStep: (step) => set({ activeStep: step }),
  
  // Sheet Management
  addSheet: (sheet) => set((state) => {
    const newSheet = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Planilha',
      type: 'custom',
      required: true,
      rowCountType: 'substances',
      fixedRowCount: 0,
      allowRepetitions: false,
      blindLinked: false,
      allowSheetAttachments: false,
      columns: [],
      order: state.sheets.length + 1,
      ...sheet
    };
    return { sheets: [...state.sheets, newSheet], selectedSheetId: newSheet.id };
  }),
  
  updateSheet: (sheetId, data) => set((state) => ({
    sheets: state.sheets.map(s => s.id === sheetId ? { ...s, ...data } : s)
  })),
  
  removeSheet: (sheetId) => set((state) => ({
    sheets: state.sheets.filter(s => s.id !== sheetId),
    selectedSheetId: state.selectedSheetId === sheetId ? null : state.selectedSheetId
  })),
  
  setSelectedSheet: (sheetId) => set({ selectedSheetId: sheetId, selectedColumnId: null }),

  // Column Management
  addColumn: (sheetId, column) => set((state) => {
    const newColumn = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Coluna',
      code: 'nova_coluna',
      fieldType: 'short_text',
      required: true,
      unit: '',
      minValue: null,
      maxValue: null,
      decimalPlaces: 0,
      allowMultiple: false,
      defaultValue: '',
      validationRules: {},
      isLocked: false,
      isDerived: false,
      allowObservation: false,
      ...column
    };
    
    return {
      sheets: state.sheets.map(s => s.id === sheetId ? {
        ...s,
        columns: [...s.columns, newColumn]
      } : s),
      selectedColumnId: newColumn.id
    };
  }),

  updateColumn: (sheetId, columnId, data) => set((state) => ({
    sheets: state.sheets.map(s => s.id === sheetId ? {
      ...s,
      columns: s.columns.map(c => c.id === columnId ? { ...c, ...data } : c)
    } : s)
  })),

  removeColumn: (sheetId, columnId) => set((state) => ({
    sheets: state.sheets.map(s => s.id === sheetId ? {
      ...s,
      columns: s.columns.filter(c => c.id !== columnId)
    } : s),
    selectedColumnId: state.selectedColumnId === columnId ? null : state.selectedColumnId
  })),

  setSelectedColumn: (columnId) => set({ selectedColumnId: columnId }),

  // Reset/Hydrate
  resetStore: () => set({ ...INITIAL_PROTOCOL_STATE, activeStep: 0, selectedSheetId: null, selectedColumnId: null }),
  
  loadProtocol: (protocolData) => {
    if (protocolData) {
      set({ 
        protocol: protocolData.protocol || INITIAL_PROTOCOL_STATE.protocol,
        sheets: protocolData.sheets || INITIAL_PROTOCOL_STATE.sheets
      });
    }
  }
}));

export default useProtocolDefinitionStore;
