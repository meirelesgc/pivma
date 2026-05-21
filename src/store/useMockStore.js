import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROCESS_STATES } from '../config/processStates'

const useMockStore = create(
  persist(
    (set, get) => ({
      user: { name: 'Dr. Henrique', role: 'Gestor de Amostras', email: 'henrique@amostras.com' },
      selectedProcessId: 'BRA-2026-004',
      processes: [
        {
          id: 'BRA-2026-004',
          name: 'Validação de Novo Método de Fototoxicidade',
          updatedAt: '2026-05-21',
          currentState: 'PLANEJAMENTO',
          status: 'Planejamento',
          role: 'Gestor de Amostras',
          ownerEmail: 'henrique@amostras.com',
          institution: 'Centro de Biotecnologia Integrada',
          technicalLead: 'Dr. Henrique Oliveira',
          submissionType: 'Validação Completa',
          scientificArea: 'Toxicologia In Vitro',
          description: 'Estudo para validação de ensaio de fototoxicidade usando modelos 3D.',
          objective: 'Identificar o potencial fototóxico de 15 compostos cosméticos.',
          documents: [],
          iaStatus: 'Apto',
          iaScore: 94,
          bracvamStatus: 'Em Planejamento',
          comments: {},
          participants: [
            { email: 'henrique@amostras.com', name: 'Dr. Henrique Oliveira', role: 'Gestor de Amostras', institution: 'CBI' },
            { email: 'carlos@gestor.com', name: 'Dr. Carlos Santos', role: 'Coordenador Grupo Gestor', institution: 'CTC' },
            { email: 'contato@bracvam.gov.br', name: 'Equipe BraCVAM', role: 'Equipe BraCVAM', institution: 'BraCVAM' }
          ],
          sponsor: { name: 'Consórcio de Cosméticos BR', category: 'Privado', contact: 'sac@consorcio.com.br', entityType: 'Indústria', notes: '' },
          protocol: { description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' },
          planningDemands: [
            {
              id: 'd-henrique-001',
              type: 'sample-coding',
              title: 'Definição e Codificação de Amostras (Cegamento)',
              description: 'Cadastrar substâncias, anexar SDS e gerar matriz de códigos cegos.',
              status: 'IN_PROGRESS',
              createdAt: '2026-05-21T09:00:00Z',
              dueDate: '2026-05-28T18:00:00Z',
              targetType: 'USER',
              targetId: 'henrique@amostras.com',
              targetName: 'Dr. Henrique Oliveira',
              createdBy: 'carlos@gestor.com',
              blocksProgression: true,
              consolidationData: null
            }
          ],
          planningConsolidated: [
            { id: 'c-001', itemTitle: 'Grupo Gestor Designado', date: '2026-05-20', responsible: 'Equipe BraCVAM', origin: 'BraCVAM' }
          ],
          milestones: [],
          samples: [],
          blindAssignments: [],
          history: [
            { timestamp: '2026-05-20T10:00:00Z', actor: 'Equipe BraCVAM', type: 'transition', description: 'Processo aprovado para planejamento.', origin: 'human' },
            { timestamp: '2026-05-21T09:00:00Z', actor: 'Dr. Carlos Santos', type: 'assignment', description: 'Designada demanda de codificação de amostras para Dr. Henrique.', origin: 'human' }
          ]
        },
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
          participants: [
            { email: 'admin@bracvam.gov.br', name: 'Equipe BraCVAM', role: 'Equipe BraCVAM', institution: 'BraCVAM' }
          ],
          sponsor: {
            name: '',
            category: '',
            contact: '',
            entityType: '',
            notes: ''
          },
          protocol: {
            description: '',
            steps: '',
            criticalParameters: '',
            acceptanceCriteria: '',
            materials: '',
            version: '1.0',
            status: 'draft', // draft, review, approved
            updatedAt: null,
            updatedBy: ''
          },
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
        },
        {
          id: 'BRA-2026-002',
          name: 'Validação de Citotoxicidade por Difusão em Agar',
          updatedAt: '2026-05-20',
          currentState: 'PLANEJAMENTO',
          status: 'Planejamento',
          role: 'Coordenador',
          ownerEmail: 'carlos@gestor.com',
          institution: 'Centro de Tecnologia Celular',
          technicalLead: 'Dr. Carlos Santos',
          submissionType: 'Validação Completa',
          scientificArea: 'Toxicologia In Vitro',
          description: 'Estudo interlaboratorial para validar o método de difusão em agar para biomateriais.',
          objective: 'Estabelecer a reprodutibilidade do método entre 3 laboratórios brasileiros.',
          documents: [],
          iaStatus: 'Apto',
          iaScore: 92,
          bracvamStatus: 'Apto para Planejamento',
          comments: {},
          participants: [
            { email: 'carlos@gestor.com', name: 'Dr. Carlos Santos', role: 'Coordenador Grupo Gestor', institution: 'CTC' },
            { email: 'contato@bracvam.gov.br', name: 'Equipe BraCVAM', role: 'Equipe BraCVAM', institution: 'BraCVAM' }
          ],
          sponsor: { name: 'BraCVAM Institutional', category: 'Público', contact: 'admin@bracvam.gov.br', entityType: 'Governamental', notes: '' },
          protocol: { description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' },
          planningDemands: [
            { 
              id: 'd1', 
              type: 'role-assignment', 
              title: 'Definir grupo de amostras', 
              description: 'Designar a equipe responsável pela codificação e logística das substâncias.',
              status: 'PENDING',
              createdAt: '2026-05-20T10:00:00Z',
              dueDate: '2026-05-25T18:00:00Z',
              targetType: 'GROUP',
              targetId: 'GRUPO_GESTOR',
              targetName: 'Grupo Gestor',
              createdBy: 'contato@bracvam.gov.br',
              blocksProgression: true,
              consolidationData: null
            },
            {
              id: 'd3',
              type: 'sample-coding',
              title: 'Plano de Codificação de Amostras',
              description: 'Cadastrar substâncias e gerar matriz de códigos cegos para os laboratórios.',
              status: 'PENDING',
              createdAt: '2026-05-20T10:00:00Z',
              dueDate: '2026-05-28T18:00:00Z',
              targetType: 'GROUP',
              targetId: 'GRUPO_AMOSTRAS',
              targetName: 'Grupo de Amostras',
              createdBy: 'contato@bracvam.gov.br',
              blocksProgression: true,
              consolidationData: null
            },
            { 
              id: 'd2', 
              type: 'macro-schedule', 
              title: 'Configurar cronograma macro', 
              description: 'Estabelecer marcos regulatórios e prazos fatais do estudo.',
              status: 'PENDING',
              createdAt: '2026-05-20T10:00:00Z',
              dueDate: '2026-05-27T18:00:00Z',
              targetType: 'GROUP',
              targetId: 'GRUPO_GESTOR',
              targetName: 'Grupo Gestor',
              createdBy: 'contato@bracvam.gov.br',
              blocksProgression: true,
              consolidationData: null
            }
          ],
          planningConsolidated: [],
          milestones: [],
          samples: [
            { id: 's1', internalName: 'Substância Teste A', batch: 'LOT-99', notes: 'Manusear sob capela' },
            { id: 's2', internalName: 'Substância Teste B', batch: 'LOT-100', notes: 'Manter refrigerado' }
          ],
          blindAssignments: [
            { sampleId: 's1', labEmail: 'lab01@biocell.com.br', blindCode: 'BLD-123' },
            { sampleId: 's2', labEmail: 'lab01@biocell.com.br', blindCode: 'BLD-456' }
          ],
          history: [
            { timestamp: '2026-05-18T09:00:00Z', actor: 'Dr. Carlos', type: 'creation', description: 'Método criado.', origin: 'human' },
            { timestamp: '2026-05-19T11:00:00Z', actor: 'IA PiVMA', type: 'triage', description: 'Triagem automatizada: Apto (Score: 92%).', origin: 'system' },
            { timestamp: '2026-05-20T10:00:00Z', actor: 'Equipe BraCVAM', type: 'transition', description: 'Aprovado para a etapa de Planejamento Institucional.', origin: 'human' }
          ]
        },
        {
          id: 'BRA-2026-003',
          name: 'Avaliação de Irritação Cutânea em Epiderme Reconstituída',
          updatedAt: '2026-05-21',
          currentState: 'EXECUCAO_METODO',
          status: 'Execução Experimental',
          role: 'Laboratório Participante',
          ownerEmail: 'lider@biotech.com',
          institution: 'BioCell Solutions',
          technicalLead: 'Dra. Ana Paula',
          submissionType: 'Validação Completa',
          scientificArea: 'Dermatotoxicologia',
          description: 'Fase experimental de validação do método de epiderme humana reconstituída.',
          objective: 'Coletar dados de viabilidade celular para 20 substâncias de teste.',
          documents: [],
          iaStatus: 'Apto',
          iaScore: 95,
          bracvamStatus: 'Em Execução',
          comments: {},
          participants: [
            { email: 'carlos@gestor.com', name: 'Dr. Carlos Santos', role: 'Coordenador Grupo Gestor', institution: 'CTC' },
            { email: 'lab01@biocell.com.br', name: 'Lab 01 - BioCell', role: 'LABORATORIO_PARTICIPANTE', institution: 'BioCell' },
            { email: 'contato@bracvam.gov.br', name: 'Equipe BraCVAM', role: 'Equipe BraCVAM', institution: 'BraCVAM' }
          ],
          sponsor: { name: 'Sponsor Global Corp', category: 'Privado', contact: 'legal@globalcorp.com', entityType: 'Indústria', notes: '' },
          protocol: { description: 'Protocolo validado v2.1', steps: '1. Preparação... 2. Exposição...', criticalParameters: 'Temperatura: 37C', acceptanceCriteria: 'Viabilidade > 50%', materials: 'Placas 24 poços', version: '2.1', status: 'approved', updatedAt: '2026-05-15T', updatedBy: 'Dr. Carlos' },
          planningDemands: [],
          planningConsolidated: [
            { id: 'c1', itemTitle: 'Grupo de Amostras Definido', date: '2026-05-10', responsible: 'Dr. Carlos', origin: 'Grupo Gestor' },
            { id: 'c2', itemTitle: 'Cronograma Macro Configurado', date: '2026-05-12', responsible: 'Dr. Carlos', origin: 'Grupo Gestor' }
          ],
          executionDemands: [
            { 
              id: 'ed1', 
              type: 'experimental-submission', 
              title: 'Submissão de registros experimentais', 
              description: 'Realizar o upload dos dados brutos e resultados (OD, planilhas de viabilidade) conforme protocolo.',
              status: 'PENDING',
              createdAt: '2026-05-21T08:00:00Z',
              dueDate: '2026-06-10T18:00:00Z',
              targetType: 'GROUP',
              targetId: 'LABORATORIO_PARTICIPANTE',
              targetName: 'Laboratórios Participantes',
              createdBy: 'Dr. Carlos',
              blocksProgression: true,
              consolidationData: null
            }
          ],
          milestones: [
            { id: 'm1', title: 'Distribuição de amostras', targetDate: '2026-05-25', status: 'pending', isGate: true },
            { id: 'm2', title: 'Execução experimental', targetDate: '2026-06-15', status: 'pending', isGate: true }
          ],
          history: [
            { timestamp: '2026-05-20T14:00:00Z', actor: 'Dr. Carlos', type: 'transition', description: 'Macroetapa de Execução Experimental iniciada.', origin: 'human' }
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
          participants: [
            { email: user?.email, name: user?.name, role: 'Proponente', institution: '' }
          ],
          sponsor: { name: '', category: '', contact: '', entityType: '', notes: '' },
          protocol: { 
            description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', 
            materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' 
          },
          planningDemands: [],
          planningConsolidated: [],
          milestones: [],
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

      // Demand Actions
      updateDemandStatus: (processId, demandId, status) => set((state) => ({
        processes: state.processes.map(p => {
          if (p.id !== processId) return p;
          const updateInArray = (arr) => (arr || []).map(d => d.id === demandId ? { ...d, status } : d);
          return {
            ...p,
            planningDemands: updateInArray(p.planningDemands),
            executionDemands: updateInArray(p.executionDemands)
          };
        })
      })),

      saveDemandDraft: (processId, demandId, draftData) => set((state) => ({
        processes: state.processes.map(p => {
          if (p.id !== processId) return p;
          const updateInArray = (arr) => (arr || []).map(d => d.id === demandId ? { 
            ...d, 
            status: 'IN_PROGRESS', 
            consolidationData: draftData 
          } : d);
          return {
            ...p,
            planningDemands: updateInArray(p.planningDemands),
            executionDemands: updateInArray(p.executionDemands)
          };
        })
      })),

      submitDemandForValidation: (processId, demandId, finalData) => set((state) => ({
        processes: state.processes.map(p => {
          if (p.id !== processId) return p;
          const updateInArray = (arr) => (arr || []).map(d => d.id === demandId ? { 
            ...d, 
            status: 'IN_VALIDATION', 
            consolidationData: finalData 
          } : d);
          return {
            ...p,
            planningDemands: updateInArray(p.planningDemands),
            executionDemands: updateInArray(p.executionDemands)
          };
        })
      })),

      consolidateDemand: (processId, demandId) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => {
            if (p.id !== processId) return p;
            
            const demand = [...(p.planningDemands || []), ...(p.executionDemands || [])].find(d => d.id === demandId);
            if (!demand) return p;

            const consolidatedItem = {
              id: Math.random().toString(36).substr(2, 9),
              itemTitle: demand.title,
              date: new Date().toLocaleDateString('pt-BR'),
              responsible: user?.name || 'Sistema',
              origin: demand.targetName
            };

            return {
              ...p,
              planningDemands: (p.planningDemands || []).filter(d => d.id !== demandId),
              executionDemands: (p.executionDemands || []).filter(d => d.id !== demandId),
              planningConsolidated: [...(p.planningConsolidated || []), consolidatedItem],
              history: [...p.history, {
                timestamp: new Date().toISOString(),
                actor: user?.name || 'Sistema',
                type: 'consolidation',
                description: `Demanda consolidada: ${demand.title}`,
                origin: 'human'
              }]
            };
          })
        }));
      },

      completePlanningDemand: (processId, demandId, consolidatedItem) => {
        // Legacy compatibility action - delegates to consolidateDemand
        get().consolidateDemand(processId, demandId);
      },

      addMilestone: (processId, milestone) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          milestones: [...(p.milestones || []), {
            ...milestone,
            id: Math.random().toString(36).substr(2, 9)
          }],
          history: [...p.history, {
            timestamp: new Date().toISOString(),
            actor: get().user?.name || 'Sistema',
            type: 'milestone',
            description: `Milestone adicionado: ${milestone.title}`,
            origin: 'human'
          }]
        } : p)
      })),

      generateBlindCodes: (processId, demandId, samples) => {
        const user = get().user;
        const process = get().processes.find(p => p.id === processId);
        const labs = (process.participants || []).filter(part => part.role === 'LABORATORIO_PARTICIPANTE');
        
        const assignments = [];
        samples.forEach(sample => {
          labs.forEach(lab => {
            const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
            assignments.push({
              sampleId: sample.id,
              labEmail: lab.email,
              blindCode: randomCode
            });
          });
        });

        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            samples,
            blindAssignments: assignments
          } : p)
        }));

        get().consolidateDemand(processId, demandId);
      },

      assignParticipant: (processId, participant) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          participants: [...(p.participants || []), { 
            ...participant, 
            status: participant.status || 'active',
            isExternal: participant.isExternal || false
          }],
          history: [...p.history, {
            timestamp: new Date().toISOString(),
            actor: get().user?.name || 'Sistema',
            type: 'assignment',
            description: `Participante adicionado: ${participant.name} como ${participant.role}`,
            origin: 'human'
          }]
        } : p)
      })),

      inviteExternalUser: (processId, email, name, role) => {
        get().assignParticipant(processId, {
          email,
          name,
          role,
          institution: 'Convidado Externo',
          status: 'pending_invite',
          isExternal: true
        });
      },

      assignGroupRole: (processId, groupRoleName, demandId) => {
        // In the MVP, assigning to a group means the demand target is set to GROUP
        // This is already handled by the Demand contract, but we can add a history log here
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'assignment',
              description: `Responsabilidade coletiva atribuída ao grupo: ${groupRoleName}`,
              origin: 'human'
            }]
          } : p)
        }));
      },

      removeParticipant: (processId, email) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          participants: (p.participants || []).filter(part => part.email !== email),
          history: [...p.history, {
            timestamp: new Date().toISOString(),
            actor: get().user?.name || 'Sistema',
            type: 'assignment',
            description: `Participante removido: ${email}`,
            origin: 'human'
          }]
        } : p)
      })),

      updateSponsor: (processId, sponsorData) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          sponsor: { ...p.sponsor, ...sponsorData },
          history: [...p.history, {
            timestamp: new Date().toISOString(),
            actor: get().user?.name || 'Sistema',
            type: 'update',
            description: 'Dados do patrocinador atualizados.',
            origin: 'human'
          }]
        } : p)
      })),

      updateProtocol: (processId, protocolData) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          protocol: { 
            ...p.protocol, 
            ...protocolData, 
            updatedAt: new Date().toISOString(),
            updatedBy: get().user?.name || 'Sistema'
          },
          history: [...p.history, {
            timestamp: new Date().toISOString(),
            actor: get().user?.name || 'Sistema',
            type: 'update',
            description: 'Protocolo técnico atualizado.',
            origin: 'human'
          }]
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

      transitionTo: (id, nextStateId, description, actor = null, options = {}) => {
        const stateConfig = PROCESS_STATES[nextStateId];
        if (!stateConfig) return;

        const process = get().processes.find(p => p.id === id);
        if (!process) return;

        const user = get().user;
        const actorName = actor || user?.name || 'Sistema';

        // Regulatory Gates Check
        if (!options.override) {
          const currentStageDemands = [...(process.planningDemands || []), ...(process.executionDemands || [])];
          const mandatoryPending = currentStageDemands.filter(d => d.blocksProgression && d.status !== 'CONSOLIDATED');
          
          if (mandatoryPending.length > 0) {
            const errorMsg = `Bloqueio Regulatório: Existem ${mandatoryPending.length} gates pendentes nesta etapa.`;
            alert(errorMsg);
            return { error: errorMsg, pending: mandatoryPending };
          }
        } else if (user?.role !== 'Admin') {
          alert('Apenas administradores podem realizar override regulatório.');
          return { error: 'Permissão negada para override.' };
        }

        set((state) => ({
          processes: state.processes.map(p => p.id === id ? {
            ...p,
            currentState: nextStateId,
            status: stateConfig.label,
            updatedAt: new Date().toISOString().split('T')[0],
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: actorName,
              type: options.override ? 'override' : 'transition',
              description: options.override 
                ? `[OVERRIDE ADM] ${description}. Justificativa: ${options.justification}`
                : description || `Transição para o estado: ${stateConfig.label}`,
              origin: actor ? 'human' : (user ? 'human' : 'system')
            }]
          } : p)
        }));
        
        return { success: true };
      },

      submitToTriage: (id) => {
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
