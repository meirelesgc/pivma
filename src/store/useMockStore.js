import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROCESS_STATES } from '../config/processStates'

const useMockStore = create(
  persist(
    (set, get) => ({
      user: { name: 'Dr. Eduardo', role: 'Patrocinador / Proponente', email: 'eduardo@lab.com' },
      selectedProcessId: null,
      processes: [
        {
          id: 'BRA-2026-001',
          name: 'Método de Irritação Ocular HCE',
          updatedAt: '2026-05-21',
          currentState: 'SUBMETIDO',
          status: 'Submetido',
          role: 'Admin',
          ownerEmail: 'proponente.externo@lab.com',
          institution: 'Instituto de BioPesquisa',
          technicalLead: 'Dr. Roberto Silva',
          submissionType: 'Validação Completa',
          scientificArea: 'Toxicologia In Vitro',
          description: 'Avaliação de irritação ocular em linhagem celular epitelial.',
          objective: 'Substituir o teste de Draize em coelhos.',
          documents: [
            { id: 'doc-1', name: 'protocolo_hce_v2.pdf', type: 'protocol' }
          ],
          iaStatus: 'Apto',
          iaScore: 88,
          bracvamStatus: 'Aguardando Revisão BraCVAM',
          comments: {},
          participants: [
            { email: 'contato@bracvam.gov.br', name: 'Equipe BraCVAM', role: 'Equipe BraCVAM', institution: 'BraCVAM' }
          ],
          sponsor: { name: 'BioPesquisa Corp', category: 'Privado', contact: 'roberto@lab.com', entityType: 'Indústria', notes: '' },
          protocol: { description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' },
          history: [
            { timestamp: '2026-05-21T10:00:00Z', actor: 'Dr. Roberto Silva', type: 'submission', description: 'Submissão realizada para avaliação BraCVAM.', origin: 'human' }
          ]
        },
        {
          id: 'BRA-2026-002',
          name: 'Validação de Citotoxicidade por Difusão em Agar',
          updatedAt: '2026-05-21',
          currentState: 'PLANEJAMENTO',
          status: 'Planejamento',
          role: 'Gerente de Validação',
          ownerEmail: 'carlos@gestor.com',
          institution: 'Centro de Tecnologia Celular',
          technicalLead: 'Dr. Carlos Santos',
          submissionType: 'Validação Completa',
          scientificArea: 'Toxicologia In Vitro',
          description: 'Estudo interlaboratorial para validar o método de difusão em agar.',
          objective: 'Estabelecer a reprodutibilidade do método entre 3 laboratórios.',
          documents: [],
          iaStatus: 'Apto',
          iaScore: 92,
          bracvamStatus: 'Apto para Planejamento',
          comments: {},
          participants: [
            { email: 'carlos@gestor.com', name: 'Dr. Carlos Santos', role: 'Gerente de Validação', institution: 'CTC' },
            { email: 'contato@bracvam.gov.br', name: 'Equipe BraCVAM', role: 'Equipe BraCVAM', institution: 'BraCVAM' }
          ],
          sponsor: { name: 'BraCVAM Institutional', category: 'Público', contact: 'admin@bracvam.gov.br', entityType: 'Governamental', notes: '' },
          protocol: { description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' },
          planningDemands: [
            { 
              id: 'd-carlos-001', 
              type: 'role-assignment', 
              title: 'Definir papéis na validação', 
              description: 'Estabelecer Lab Líder, Participantes, Gestor de Amostras e Revisores.',
              status: 'PENDING',
              createdAt: '2026-05-20T10:00:00Z',
              dueDate: '2026-05-25T18:00:00Z',
              targetType: 'USER',
              targetId: 'carlos@gestor.com',
              targetName: 'Dr. Carlos Santos',
              createdBy: 'contato@bracvam.gov.br',
              blocksProgression: true,
              suggestedRole: 'LABORATORIO_LIDER',
              consolidationData: null
            },
            { 
              id: 'd-carlos-003', 
              type: 'macro-schedule', 
              title: 'Cronograma Macro', 
              description: 'Definir desfecho principal, desenho experimental e marcos temporais.',
              status: 'PENDING',
              createdAt: '2026-05-20T10:00:00Z',
              dueDate: '2026-05-27T18:00:00Z',
              targetType: 'USER',
              targetId: 'carlos@gestor.com',
              targetName: 'Dr. Carlos Santos',
              createdBy: 'contato@bracvam.gov.br',
              blocksProgression: true,
              consolidationData: null
            },
            { 
              id: 'd-carlos-004', 
              type: 'protocol-definition', 
              title: 'Definir Protocolo Padronizado de Teste', 
              description: 'Elaborar o protocolo técnico detalhado que será seguido por todos os laboratórios.',
              status: 'PENDING',
              createdAt: '2026-05-29T10:00:00Z',
              dueDate: '2026-06-10T18:00:00Z',
              targetType: 'USER',
              targetId: 'carlos@gestor.com',
              targetName: 'Dr. Carlos Santos',
              createdBy: 'contato@bracvam.gov.br',
              blocksProgression: true,
              consolidationData: null
            }
          ],
          planningConsolidated: [],
          milestones: [],
          history: [
            { timestamp: '2026-05-21T09:00:00Z', actor: 'Equipe BraCVAM', type: 'transition', description: 'Status alterado para Planejamento.', origin: 'human' }
          ]
        },
        {
          id: 'BRA-2026-003',
          name: 'Avaliação de Irritação Cutânea em Epiderme Reconstituída',
          updatedAt: '2026-05-21',
          currentState: 'EXECUCAO_METODO',
          status: 'Execução Experimental',
          role: 'Laboratório Participante',
          ownerEmail: 'outro@lab.com',
          institution: 'BioCell Solutions',
          technicalLead: 'Dra. Ana Paula',
          submissionType: 'Validação Completa',
          scientificArea: 'Dermatotoxicologia',
          description: 'Fase experimental de validação do método de epiderme humana.',
          objective: 'Coletar dados de viabilidade celular seguindo BPL.',
          documents: [],
          iaStatus: 'Apto',
          iaScore: 95,
          bracvamStatus: 'Em Execução',
          comments: {},
          participants: [
            { email: 'lab01@biocell.com.br', name: 'Lab 01 - BioCell', role: 'LABORATORIO_PARTICIPANTE', institution: 'BioCell' },
            { email: 'carlos@gestor.com', name: 'Dr. Carlos Santos', role: 'Gerente de Validação', institution: 'CTC' }
          ],
          sponsor: { name: 'Sponsor Global Corp', category: 'Privado', contact: 'legal@globalcorp.com', entityType: 'Indústria', notes: '' },
          protocol: { description: 'Protocolo validado v2.1', steps: '1. Preparação...', criticalParameters: 'Temperatura: 37C', acceptanceCriteria: 'Viabilidade > 50%', materials: 'Placas 24 poços', version: '2.1', status: 'approved', updatedAt: '2026-05-15', updatedBy: 'Dr. Carlos' },
          executionDemands: [
            { 
              id: 'ed1', 
              type: 'experimental-submission', 
              title: 'Upload de Dados Brutos (BPL)', 
              description: 'Realizar o upload dos dados brutos e resultados conforme protocolo.',
              status: 'PENDING',
              createdAt: '2026-05-21T08:00:00Z',
              dueDate: '2026-06-10T18:00:00Z',
              targetType: 'USER',
              targetId: 'lab01@biocell.com.br',
              targetName: 'Lab 01 - BioCell',
              createdBy: 'Dr. Carlos',
              blocksProgression: true,
              consolidationData: null
            }
          ],
          milestones: [
            { id: 'm1', title: 'Distribuição de amostras', targetDate: '2026-05-25', status: 'pending', isGate: true }
          ],
          blindAssignments: [
            { id: 'ba-001', labEmail: 'lab01@biocell.com.br', blindCode: 'AM-7492', status: 'SHIPPED' },
            { id: 'ba-002', labEmail: 'lab01@biocell.com.br', blindCode: 'AM-1048', status: 'SHIPPED' }
          ],
          history: [
            { timestamp: '2026-05-20T14:00:00Z', actor: 'Dr. Carlos', type: 'transition', description: 'Início da execução experimental.', origin: 'human' }
          ]
        },
        {
          id: 'BRA-2026-004',
          name: 'Validação de Novo Método de Fototoxicidade',
          updatedAt: '2026-05-21',
          currentState: 'PLANEJAMENTO',
          status: 'Planejamento',
          role: 'Gestor de Amostras',
          ownerEmail: 'outro.gestor@amostras.com',
          institution: 'Centro de Biotecnologia Integrada',
          technicalLead: 'Dr. Henrique Oliveira',
          submissionType: 'Validação Completa',
          scientificArea: 'Toxicologia In Vitro',
          description: 'Estudo para validação de ensaio de fototoxicidade.',
          objective: 'Identificar potencial fototóxico de compostos cosméticos.',
          documents: [],
          iaStatus: 'Apto',
          iaScore: 94,
          bracvamStatus: 'Em Planejamento',
          comments: {},
          participants: [
            { email: 'henrique@amostras.com', name: 'Dr. Henrique Oliveira', role: 'Gestor de Amostras', institution: 'CBI' },
            { email: 'lab01@biocell.com.br', name: 'Lab 01 - BioCell', role: 'LABORATORIO_PARTICIPANTE', institution: 'BioCell' },
            { email: 'carlos@gestor.com', name: 'Dr. Carlos Santos', role: 'Gerente de Validação', institution: 'CTC' }
          ],
          sponsor: { name: 'Consórcio de Cosméticos BR', category: 'Privado', contact: 'sac@consorcio.com.br', entityType: 'Indústria', notes: '' },
          protocol: { description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' },
          planningDemands: [
            {
              id: 'd-henrique-001',
              type: 'sample-coding',
              title: 'Codificação e Logística de Amostras',
              description: 'Cadastrar substâncias, anexar SDS e gerar matriz de cegamento.',
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
            { id: 'c-001', itemTitle: 'Gerente de Validação Designado', date: '2026-05-20', responsible: 'Equipe BraCVAM', origin: 'BraCVAM' }
          ],
          milestones: [],
          samples: [],
          blindAssignments: [],
          shipments: [],
          occurrences: [],
          sampleInventory: [],
          endpoint: { target: '', isLocked: false },
          history: [
            { timestamp: '2026-05-21T09:00:00Z', actor: 'Dr. Carlos Santos', type: 'assignment', description: 'Atribuída tarefa de codificação ao Dr. Henrique.', origin: 'human' }
          ]
        }
      ],

      addTrialRecord: (processId, trial) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            trialRecords: [...(p.trialRecords || []), {
              ...trial,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
              operator: user?.name
            }],
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'trial_record',
              description: `Novo ensaio registrado para amostra ${trial.blindCode}`,
              origin: 'human'
            }]
          } : p)
        }));
      },

      uploadTemplateSubmission: (processId, sheetId, fileData) => {
        const user = get().user;
        const submissionId = Math.random().toString(36).substr(2, 9);
        
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            templateSubmissions: [
              ...(p.templateSubmissions || []),
              {
                id: submissionId,
                sheetId,
                fileName: fileData.name,
                fileSize: fileData.size,
                status: 'VALIDATING',
                uploadedAt: new Date().toISOString(),
                uploadedBy: user?.name,
                labEmail: user?.email,
                validationLogs: []
              }
            ],
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'upload',
              description: `Template uploaded: ${fileData.name} for sheet ${sheetId}`,
              origin: 'human'
            }]
          } : p)
        }));

        // Simulate validation delay
        setTimeout(() => {
          get().validateTemplateSubmission(processId, submissionId);
        }, 2000);
      },

      validateTemplateSubmission: (processId, submissionId) => {
        set((state) => ({
          processes: state.processes.map(p => {
            if (p.id !== processId) return p;
            
            const submission = (p.templateSubmissions || []).find(s => s.id === submissionId);
            if (!submission) return p;

            // Mock validation logic
            const hasErrors = Math.random() > 0.7; // 30% chance of error
            const logs = [
              { type: 'structural', message: 'Verificação de abas obrigatórias: OK', status: 'success' },
              { type: 'syntactic', message: 'Validação de tipos de dados: OK', status: 'success' },
            ];

            if (hasErrors) {
              logs.push({ type: 'semantic', message: 'Erro de replicata: Diferença entre R1 e R2 superior ao limite de 15%', status: 'error' });
            } else {
              logs.push({ type: 'semantic', message: 'Consistência experimental validada', status: 'success' });
            }

            return {
              ...p,
              templateSubmissions: p.templateSubmissions.map(s => 
                s.id === submissionId ? { 
                  ...s, 
                  status: hasErrors ? 'VALIDATION_FAILED' : 'VALIDATED',
                  validationLogs: logs 
                } : s
              )
            };
          })
        }));
      },

      updateLabConsolidation: (processId, labEmail, data) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            labConsolidations: {
              ...(p.labConsolidations || {}),
              [labEmail]: {
                ...data,
                updatedAt: new Date().toISOString(),
                updatedBy: user?.name
              }
            },
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'consolidation',
              description: `Consolidação final salva pelo laboratório ${labEmail}`,
              origin: 'human'
            }]
          } : p)
        }));
      },

      registerMaterialReturn: (processId, labEmail, returnData) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            materialReturns: {
              ...(p.materialReturns || {}),
              [labEmail]: {
                ...returnData,
                returnedAt: new Date().toISOString()
              }
            },
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'material_return',
              description: `Registro de devolução de materiais pelo laboratório ${labEmail}`,
              origin: 'human'
            }]
          } : p)
        }));
      },

      setUser: (user) => set({ user }),
      logout: () => set({ user: null, selectedProcessId: null }),
      setSelectedProcessId: (id) => set({ selectedProcessId: id }),

      addProcess: (process) => set((state) => ({
        processes: [
          ...state.processes,
          {
            ...process,
            currentState: process.currentState || 'RASCUNHO',
            ownerEmail: state.user?.email || '',
            participants: process.participants || [
              { email: state.user?.email, name: state.user?.name, role: 'Proponente', institution: 'Indefinida' }
            ],
            history: process.history || [
              { 
                timestamp: new Date().toISOString(), 
                actor: state.user?.name || 'Sistema', 
                type: 'creation', 
                description: 'Processo iniciado pelo proponente.', 
                origin: 'human' 
              }
            ],
            comments: process.comments || {},
            protocol: process.protocol || { description: '', steps: '', criticalParameters: '', acceptanceCriteria: '', materials: '', version: '1.0', status: 'draft', updatedAt: null, updatedBy: '' },
            documents: process.documents || []
          }
        ]
      })),

      // Advanced Sample Actions
      setEndpoint: (processId, target) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          endpoint: { target, isLocked: true },
          history: [...p.history, {
            timestamp: new Date().toISOString(),
            actor: get().user?.name || 'Sistema',
            type: 'update',
            description: `Endpoint registrado: ${target}`,
            origin: 'human'
          }]
        } : p)
      })),

      updateSamples: (processId, samples) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? { ...p, samples } : p)
      })),

      generateBlindCodes: (processId, demandId, samples) => {
        const user = get().user;
        const process = get().processes.find(p => p.id === processId);
        const labs = (process.participants || []).filter(part => part.role === 'LABORATORIO_PARTICIPANTE');
        
        const assignments = [];
        samples.forEach(sample => {
          labs.forEach(lab => {
            // Generate a non-sequential alphanumeric code (e.g., XPTO59)
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomCode = '';
            for (let i = 0; i < 6; i++) {
              randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            assignments.push({
              id: Math.random().toString(36).substr(2, 9),
              sampleId: sample.id,
              labEmail: lab.email,
              labName: lab.name,
              blindCode: randomCode,
              status: 'PENDING', // PENDING, SHIPPED, RECEIVED
              qrCodeData: `PIVMA-SAMPLE-${randomCode}`
            });
          });
        });

        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            samples,
            blindAssignments: assignments,
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'coding',
              description: `Matriz de cegamento gerada para ${samples.length} substâncias e ${labs.length} laboratórios.`,
              origin: 'human'
            }]
          } : p)
        }));
      },

      registerShipment: (processId, labEmail, trackingNumber, documents) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => {
            if (p.id !== processId) return p;
            
            const newShipment = {
              id: Math.random().toString(36).substr(2, 9),
              labEmail,
              trackingNumber,
              documents,
              status: 'SHIPPED',
              sentAt: new Date().toISOString(),
              sentBy: user?.name
            };

            const updatedAssignments = (p.blindAssignments || []).map(ba => 
              ba.labEmail === labEmail ? { ...ba, status: 'SHIPPED' } : ba
            );

            return {
              ...p,
              shipments: [...(p.shipments || []), newShipment],
              blindAssignments: updatedAssignments,
              history: [...p.history, {
                timestamp: new Date().toISOString(),
                actor: user?.name || 'Sistema',
                type: 'shipment',
                description: `Kit de amostras enviado para o laboratório ${labEmail}. Rastreio: ${trackingNumber}`,
                origin: 'human'
              }]
            };
          })
        }));
      },

      confirmReceipt: (processId, labEmail, codesReceived) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => {
            if (p.id !== processId) return p;

            const updatedAssignments = (p.blindAssignments || []).map(ba => 
              (ba.labEmail === labEmail && codesReceived.includes(ba.blindCode)) 
                ? { ...ba, status: 'RECEIVED', receivedAt: new Date().toISOString() } 
                : ba
            );

            const allReceived = updatedAssignments
              .filter(ba => ba.labEmail === labEmail)
              .every(ba => ba.status === 'RECEIVED');

            const updatedShipments = (p.shipments || []).map(s => 
              (s.labEmail === labEmail && allReceived) ? { ...s, status: 'RECEIVED', receivedAt: new Date().toISOString() } : s
            );

            return {
              ...p,
              blindAssignments: updatedAssignments,
              shipments: updatedShipments,
              history: [...p.history, {
                timestamp: new Date().toISOString(),
                actor: user?.name || 'Sistema',
                type: 'receipt',
                description: `Recebimento de amostras confirmado pelo laboratório ${labEmail}.`,
                origin: 'human'
              }]
            };
          })
        }));
      },

      registerOccurrence: (processId, occurrence) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => p.id === processId ? {
            ...p,
            occurrences: [...(p.occurrences || []), {
              ...occurrence,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString(),
              reportedBy: user?.name
            }],
            history: [...p.history, {
              timestamp: new Date().toISOString(),
              actor: user?.name || 'Sistema',
              type: 'occurrence',
              description: `Ocorrência registrada: ${occurrence.type} na amostra ${occurrence.blindCode}`,
              origin: 'human'
            }]
          } : p)
        }));
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

      assignGroupRole: (processId, groupRoleName) => {
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

      addMilestone: (processId, milestone) => set((state) => ({
        processes: state.processes.map(p => p.id === processId ? {
          ...p,
          milestones: [...(p.milestones || []), {
            ...milestone,
            id: Math.random().toString(36).substr(2, 9),
            updatedAt: new Date().toISOString()
          }]
        } : p)
      })),

      saveDemandDraft: (processId, demandId, data) => set((state) => ({
        processes: state.processes.map(p => {
          if (p.id !== processId) return p;
          const updateDemand = (d) => d.id === demandId ? { ...d, consolidationData: data, status: 'IN_PROGRESS' } : d;
          return {
            ...p,
            planningDemands: (p.planningDemands || []).map(updateDemand),
            executionDemands: (p.executionDemands || []).map(updateDemand)
          };
        })
      })),

      consolidateDemand: (processId, demandId, data = null) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => {
            if (p.id !== processId) return p;
            
            const demand = [...(p.planningDemands || []), ...(p.executionDemands || [])].find(d => d.id === demandId);
            if (!demand) return p;

            const consolidatedItem = {
              id: demand.id,
              itemTitle: demand.title,
              date: new Date().toISOString().split('T')[0],
              responsible: user?.name || 'Sistema',
              origin: 'Plataforma',
              status: 'CONSOLIDATED',
              consolidationData: data || demand.consolidationData,
              consolidatedAt: new Date().toISOString(),
              consolidatedBy: user?.name
            };

            const isPlanning = (p.planningDemands || []).some(d => d.id === demandId);

            return {
              ...p,
              planningDemands: (p.planningDemands || []).filter(d => d.id !== demandId),
              executionDemands: (p.executionDemands || []).filter(d => d.id !== demandId),
              planningConsolidated: isPlanning 
                ? [...(p.planningConsolidated || []), consolidatedItem]
                : (p.planningConsolidated || []),
              history: [...p.history, {
                timestamp: new Date().toISOString(),
                actor: user?.name || 'Sistema',
                type: 'consolidation',
                description: `Demanda consolidada: ${demand?.title || demandId}`,
                origin: 'human'
              }]
            };
          })
        }));
      },

      submitDemandForValidation: (processId, demandId, data) => {
        const user = get().user;
        set((state) => ({
          processes: state.processes.map(p => {
            if (p.id !== processId) return p;
            const updateDemand = (d) => d.id === demandId ? { 
              ...d, 
              status: 'SUBMITTED_FOR_VALIDATION', 
              consolidationData: data,
              submittedAt: new Date().toISOString(),
              submittedBy: user?.name
            } : d;

            const demand = [...(p.planningDemands || []), ...(p.executionDemands || [])].find(d => d.id === demandId);

            return {
              ...p,
              planningDemands: (p.planningDemands || []).map(updateDemand),
              executionDemands: (p.executionDemands || []).map(updateDemand),
              history: [...p.history, {
                timestamp: new Date().toISOString(),
                actor: user?.name || 'Sistema',
                type: 'submission',
                description: `Demanda enviada para validação: ${demand?.title || demandId}`,
                origin: 'human'
              }]
            };
          })
        }));
      },

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
        const result = get().transitionTo(id, 'SUBMETIDO', 'Submissão realizada para triagem.');
        
        if (result?.error) return;

        // Reset IA status for fresh analysis
        set((state) => ({
          processes: state.processes.map(p => p.id === id ? { 
            ...p, 
            iaStatus: 'Processando...',
            iaScore: 0,
            bracvamStatus: 'Aguardando Triagem IA'
          } : p)
        }));

        // Simulate IA Triage delay
        setTimeout(() => {
          const process = get().processes.find(p => p.id === id);
          if (!process || process.currentState !== 'SUBMETIDO') return;

          get().transitionTo(
            id, 
            'TRIAGEM_IA', 
            'IA Pi*VMA iniciou a análise documental.',
            'IA Pi*VMA'
          );

          setTimeout(() => {
            const processLatest = get().processes.find(p => p.id === id);
            if (!processLatest || processLatest.currentState !== 'TRIAGEM_IA') return;

            get().transitionTo(
              id, 
              'PENDENTE_AJUSTE', 
              'IA detectou pendência documental (Score: 65%). Falta Protocolo Detalhado.',
              'IA Pi*VMA'
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

      updateProcessData: (id, data) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p)
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
