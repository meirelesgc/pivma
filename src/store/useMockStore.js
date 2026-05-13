import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useMockStore = create(
  persist(
    (set, get) => ({
      user: null, // { name: 'Dr. Eduardo', role: 'Proponente', email: 'eduardo@lab.com' }
      selectedProcessId: null,
      processes: [
        {
          id: 'BRA-2026-001',
          name: 'Método de Irritação Ocular HCE',
          updatedAt: '2026-05-10',
          status: 'Em Triagem (IA)',
          role: 'Proponente',
          ownerEmail: 'admin@bracvam.gov.br',
          institution: 'Instituto de BioPesquisa',
          technicalLead: 'Dr. Roberto Silva',
          submissionType: 'Validação Completa',
          scientificArea: 'Toxicologia In Vitro',
          description: 'Avaliação de irritação ocular em linhagem celular epitelial.',
          objective: 'Substituir o teste de Draize em coelhos para substâncias químicas específicas.',
          documents: [
            { id: 'doc-1', name: 'protocolo_hce_v2.pdf', type: 'protocol' },
            { id: 'doc-2', name: 'artigo_nature_2024.pdf', type: 'article' }
          ],
          iaStatus: 'Apto',
          iaScore: 88,
          bracvamStatus: 'Aguardando Revisão',
          history: [
            { 
              timestamp: '2026-05-08T10:00:00Z', 
              actor: 'Dr. Eduardo', 
              type: 'creation', 
              description: 'Método criado e rascunho inicial salvo.',
              origin: 'human'
            },
            { 
              timestamp: '2026-05-10T14:30:00Z', 
              actor: 'Dr. Eduardo', 
              type: 'submission', 
              description: 'Submissão realizada para triagem.',
              origin: 'human'
            },
            { 
              timestamp: '2026-05-10T14:35:00Z', 
              actor: 'IA PiVMA', 
              type: 'triage', 
              description: 'Triagem automatizada concluída. Status: Apto (Score: 88%).',
              origin: 'system'
            }
          ]
        }
      ],

      setUser: (user) => set({ user }),
      logout: () => set({ user: null, selectedProcessId: null }),
      setSelectedProcessId: (id) => set({ selectedProcessId: id }),
      
      addProcess: (process) => {
        const user = get().user
        const newProcess = {
          ...process,
          ownerEmail: user?.email,
          institution: '',
          technicalLead: user?.name || '',
          submissionType: '',
          scientificArea: '',
          objective: '',
          documents: [],
          iaStatus: 'Pendente',
          iaScore: 0,
          bracvamStatus: 'Rascunho',
          history: [
            { 
              timestamp: new Date().toISOString(), 
              actor: user?.name || 'Usuário', 
              type: 'creation', 
              description: 'Método criado e rascunho inicial salvo.',
              origin: 'human'
            }
          ]
        }
        set((state) => ({ processes: [newProcess, ...state.processes] }))
      },

      updateProcessData: (id, data) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { 
          ...p, 
          ...data, 
          updatedAt: new Date().toISOString().split('T')[0] 
        } : p)
      })),

      addEvent: (id, event) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { 
          ...p, 
          history: [...p.history, { ...event, timestamp: new Date().toISOString() }] 
        } : p)
      })),

      submitToTriage: (id) => {
        const user = get().user
        set((state) => ({
          processes: state.processes.map(p => p.id === id ? { 
            ...p, 
            status: 'Em Triagem (IA)',
            bracvamStatus: 'Em Triagem',
            updatedAt: new Date().toISOString().split('T')[0],
            history: [...p.history, { 
              timestamp: new Date().toISOString(), 
              actor: user?.name || 'Usuário', 
              type: 'submission', 
              description: 'Submissão realizada para triagem.',
              origin: 'human'
            }]
          } : p)
        }))

        // Simulate IA Triage delay
        setTimeout(() => {
          set((state) => ({
            processes: state.processes.map(p => p.id === id ? { 
              ...p, 
              status: 'Pendente / Necessita Ajustes',
              iaStatus: 'Pendência Documental',
              iaScore: 65,
              bracvamStatus: 'Aguardando Proponente',
              history: [...p.history, { 
                timestamp: new Date().toISOString(), 
                actor: 'IA PiVMA', 
                type: 'triage', 
                description: 'IA detectou pendência documental (Score: 65%). Falta Protocolo Detalhado.',
                origin: 'system'
              }]
            } : p)
          }))
        }, 3000)
      },

      updateProcessStatus: (id, status) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p)
      })),

      addContestation: (id, justification) => {
        const user = get().user
        set((state) => ({
          processes: state.processes.map(p => p.id === id ? { 
            ...p, 
            status: 'Contestado (Aguardando Validação BraCVAM)', 
            bracvamStatus: 'Revisão Humana Solicitada',
            justification,
            updatedAt: new Date().toISOString().split('T')[0],
            history: [...p.history, { 
              timestamp: new Date().toISOString(), 
              actor: user?.name || 'Usuário', 
              type: 'contestation', 
              description: `Contestação registrada: ${justification.substring(0, 50)}...`,
              origin: 'human'
            }]
          } : p)
        }))
      }
    }),
    {
      name: 'pivma-mock-storage'
    }
  )
)

export default useMockStore
