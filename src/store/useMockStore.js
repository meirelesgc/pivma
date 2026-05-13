import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useMockStore = create(
  persist(
    (set) => ({
      user: null, // { name: 'Dr. Eduardo', role: 'Proponente', email: 'eduardo@lab.com' }
      processes: [
        {
          id: 'BRA-2026-001',
          name: 'Método de Irritação Ocular HCE',
          updatedAt: '2026-05-10',
          status: 'Em Triagem (IA)',
          role: 'Proponente',
          ownerEmail: 'admin@bracvam.gov.br', // Not owned by Dr. Eduardo
          description: 'Avaliação de irritação ocular em linhagem celular epitelial.',
          tasks: [
            { id: 1, title: 'Revisar relatório de citotoxicidade', deadline: '2026-05-15' }
          ]
        }
      ],

      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      
      addProcess: (process) => set((state) => ({ 
        processes: [{ ...process, ownerEmail: state.user?.email }, ...state.processes] 
      })),

      updateProcessStatus: (id, status) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p)
      })),

      addContestation: (id, justification) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { 
          ...p, 
          status: 'Contestado (Aguardando Validação BraCVAM)', 
          justification,
          updatedAt: new Date().toISOString().split('T')[0] 
        } : p)
      }))
    }),
    {
      name: 'pivma-mock-storage'
    }
  )
)

export default useMockStore
