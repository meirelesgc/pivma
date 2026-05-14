import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROCESS_STATES } from '../config/processStates'

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
          currentState: 'TRIAGEM_IA',
          status: 'Em Triagem (IA)', // Keep for compatibility temporarily
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
          comments: {}, // { fieldId: [{ id, author, text, timestamp, status: 'pending'|'resolved', type }] }
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
          currentState: 'RASCUNHO',
          status: 'Rascunho',
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
          comments: {},
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

      addComment: (processId, fieldId, comment) => {
        const user = get().user;
        const newComment = {
          id: Math.random().toString(36).substr(2, 9),
          author: user?.name || 'Revisor BraCVAM',
          timestamp: new Date().toISOString(),
          status: 'pending',
          ...comment
        };

        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            comments: {
              ...p.comments,
              [fieldId]: [...(p.comments[fieldId] || []), newComment]
            }
          } : p)
        }));
      },

      resolveComment: (processId, fieldId, commentId) => {
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            comments: {
              ...p.comments,
              [fieldId]: (p.comments[fieldId] || []).map(c => 
                c.id === commentId ? { ...c, status: 'resolved' } : c
              )
            }
          } : p)
        }));
      },

      transitionTo: (id, nextStateId, description, actor = null) => {
        const stateConfig = PROCESS_STATES[nextStateId];
        if (!stateConfig) return;

        const user = get().user;
        const actorName = actor || user?.name || 'Sistema';

        set((state) => ({
          processes: state.processes.map(p => p.id === id ? {
            ...p,
            currentState: nextStateId,
            status: stateConfig.label,
            updatedAt: new Date().toISOString().split('T')[0],
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: actorName,
              type: 'transition',
              description: description || `Transição para o estado: ${stateConfig.label}`,
              origin: actor ? 'human' : (user ? 'human' : 'system')
            }]
          } : p)
        }));
      },

      submitToTriage: (id) => {
        const user = get().user;
        get().transitionTo(id, 'SUBMETIDO', 'Submissão realizada para triagem.');

        // Simulate IA Triage delay
        setTimeout(() => {
          get().transitionTo(
            id, 
            'TRIAGEM_IA', 
            'IA PiVMA iniciou a análise documental.',
            'IA PiVMA'
          );

          setTimeout(() => {
            get().transitionTo(
              id, 
              'PENDENTE_AJUSTE', 
              'IA detectou pendência documental (Score: 65%). Falta Protocolo Detalhado.',
              'IA PiVMA'
            );
            
            set((state) => ({
              processes: state.processes.map(p => p.id === id ? { 
                ...p, 
                iaStatus: 'Pendência Documental',
                iaScore: 65,
                bracvamStatus: 'Aguardando Proponente'
              } : p)
            }));
          }, 2000);
        }, 1500);
      },

      updateProcessStatus: (id, status) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p)
      })),

      addContestation: (id, justification) => {
        get().transitionTo(
          id, 
          'CONTESTADO', 
          `Contestação registrada: ${justification.substring(0, 50)}...`
        );
        
        set((state) => ({
          processes: state.processes.map(p => p.id === id ? { 
            ...p, 
            bracvamStatus: 'Revisão Humana Solicitada',
            justification
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
