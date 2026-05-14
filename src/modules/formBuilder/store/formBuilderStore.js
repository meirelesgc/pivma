import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_TEMPLATES } from './mockData';

const useFormBuilderStore = create(
  persist(
    (set, get) => ({
      templates: MOCK_TEMPLATES,
      selectedTemplateId: MOCK_TEMPLATES[0]?.id || null,

      setSelectedTemplate: (id) => set({ selectedTemplateId: id }),

      updateTemplate: (id, data) => set((state) => ({
        templates: state.templates.map(t => t.id === id ? { ...t, ...data } : t)
      })),

      addSection: (templateId, section) => set((state) => ({
        templates: state.templates.map(t => t.id === templateId ? {
          ...t,
          sections: [...t.sections, { ...section, id: `sec-${Math.random().toString(36).substr(2, 9)}`, order: t.sections.length + 1 }]
        } : t)
      })),

      updateSection: (templateId, sectionId, data) => set((state) => ({
        templates: state.templates.map(t => t.id === templateId ? {
          ...t,
          sections: t.sections.map(s => s.id === sectionId ? { ...s, ...data } : s)
        } : t)
      })),

      removeSection: (templateId, sectionId) => set((state) => ({
        templates: state.templates.map(t => t.id === templateId ? {
          ...t,
          sections: t.sections.filter(s => s.id !== sectionId)
        } : t)
      })),

      updateAiConfig: (templateId, sectionId, aiConfig) => set((state) => ({
        templates: state.templates.map(t => t.id === templateId ? {
          ...t,
          sections: t.sections.map(s => s.id === sectionId ? {
            ...s,
            aiPromptConfig: { ...(s.aiPromptConfig || {}), ...aiConfig }
          } : s)
        } : t)
      }))
    }),
    {
      name: 'pivma-form-builder-storage'
    }
  )
);

export default useFormBuilderStore;
