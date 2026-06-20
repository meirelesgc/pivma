import initialUsers from '../data/mock/users.json'
import initialAvailableProcesses from '../data/mock/available_processes.json'
import initialProcessInstances from '../data/mock/process_instances.json'
import initialProcessInstanceRoles from '../data/mock/process_instance_roles.json'
import initialProcessSteps from '../data/mock/process_steps.json'
import initialProcessInstanceSteps from '../data/mock/process_instance_steps.json'
import initialTasks from '../data/mock/tasks.json'
import initialProcessInstanceTasks from '../data/mock/process_instance_tasks.json'
import initialFormFields from '../data/mock/form_fields.json'
import initialFieldReviews from '../data/mock/field_reviews.json'
import initialPendingInvites from '../data/mock/pending_invites.json'
import initialSampleDefinitions from '../data/mock/sample_definitions.json'
import initialSampleBlindCodes from '../data/mock/sample_blind_codes.json'
import initialDataTemplates from '../data/mock/data_templates.json'
import initialDataTemplateColumns from '../data/mock/data_template_columns.json'
import initialAuditLogs from '../data/mock/audit_logs.json'
import initialAdhocOpinions from '../data/mock/adhoc_opinions.json'
import initialGestorConsolidations from '../data/mock/gestor_consolidations.json'
import initialFinalDeliberations from '../data/mock/final_deliberations.json'

// Carrega os dados em memória para simular operações em um banco de dados local mutável
let users = [...initialUsers]
let availableProcesses = [...initialAvailableProcesses]
let processInstances = [...initialProcessInstances]
let processInstanceRoles = [...initialProcessInstanceRoles]
let processSteps = [...initialProcessSteps]
let processInstanceSteps = [...initialProcessInstanceSteps]
let tasks = [...initialTasks]
let processInstanceTasks = [...initialProcessInstanceTasks]
let formFields = [...initialFormFields]
let fieldReviews = [...initialFieldReviews]
let pendingInvites = [...initialPendingInvites]
let sampleDefinitions = [...initialSampleDefinitions]
let sampleBlindCodes = [...initialSampleBlindCodes]
let dataTemplates = [...initialDataTemplates]
let dataTemplateColumns = [...initialDataTemplateColumns]
let auditLogs = [...initialAuditLogs]
let adhocOpinions = [...initialAdhocOpinions]
let gestorConsolidations = [...initialGestorConsolidations]
let finalDeliberations = [...initialFinalDeliberations]
let formAnswers = {
  1: {
    "1": "Método de Citotoxicidade In Vitro",
    "2": "Substituição do ensaio in vivo em animais por linhagem celular estável.",
    "3": "3",
    "4": "100.0",
    "5": "pop_citotoxicidade_v1.pdf"
  },
  11: {
    "6": "desenho_estudo_final.pdf",
    "7": "criterios_aceitacao_v2.pdf",
    "8": "plano_estatistico_aprovado.pdf",
    "9": "analise_erros_mitigacao.pdf"
  }
} // Chaveada por process_instance_task_id

const getCurrentUser = () => {
  const token = localStorage.getItem('token')
  if (token) {
    return users.find(u => u.id === Number(token))
  }
  return null
}

const addAuditLog = (instanceId, actionType, description, whereContext = "Geral") => {
  const currentUser = getCurrentUser() || { id: 0, name: 'Sistema', email: 'sistema@bracvam.gov.br' }
  const newId = auditLogs.length > 0 ? Math.max(...auditLogs.map(l => l.id)) + 1 : 1
  
  const logEntry = {
    id: newId,
    process_instance_id: Number(instanceId),
    user_id: currentUser.id,
    user_name: currentUser.name,
    user_email: currentUser.email,
    action: actionType,
    description: description,
    where_context: whereContext,
    timestamp: new Date().toISOString()
  }
  auditLogs.push(logEntry)
  return logEntry
}


const checkAndCompleteStep = (stepInstanceId) => {
  const totalTasksForStep = processInstanceTasks.filter(t => t.process_instance_step_id === stepInstanceId)
  const completedTasksForStep = totalTasksForStep.filter(t => t.is_completed === true)

  if (totalTasksForStep.length > 0 && totalTasksForStep.length === completedTasksForStep.length) {
    const stepInstance = processInstanceSteps.find(s => s.id === stepInstanceId)
    if (stepInstance) {
      stepInstance.is_completed = true

      const currentStepDef = processSteps.find(s => s.id === stepInstance.step_id)
      if (currentStepDef) {
        const nextStepDef = processSteps.find(
          s => s.process_id === currentStepDef.process_id && s.sequence === currentStepDef.sequence + 1
        )

        if (nextStepDef) {
          const nextStepInstance = processInstanceSteps.find(
            s => s.process_instance_id === stepInstance.process_instance_id && s.step_id === nextStepDef.id
          )
          if (nextStepInstance) {
            const existingNextTasks = processInstanceTasks.filter(t => t.process_instance_step_id === nextStepInstance.id)
            if (existingNextTasks.length === 0) {
              const tasksForNextStep = tasks.filter(t => t.step_id === nextStepDef.id)
              tasksForNextStep.forEach(task => {
                const newInstanceTaskId = processInstanceTasks.length > 0 ? Math.max(...processInstanceTasks.map(pit => pit.id)) + 1 : 1
                processInstanceTasks.push({
                  id: newInstanceTaskId,
                  process_instance_id: stepInstance.process_instance_id,
                  process_instance_step_id: nextStepInstance.id,
                  task_id: task.id,
                  is_completed: false,
                  status: task.type === 'form' ? 'pending_submission' : 'pending',
                  current_reviewer_role: null,
                  current_review_round_id: task.type === 'form' ? 1 : null,
                  editable: task.type === 'form' ? true : false
                })
              })
            }
          }
        }
      }
    }
  }
}

export const db = {
  // Usuários
  getUsers: () => users.map(u => ({ ...u })),
  getUserById: (id) => {
    const u = users.find(u => u.id === Number(id) || String(u.id) === String(id))
    return u ? { ...u } : undefined
  },
  setUsers: (newUsers) => {
    users = [...newUsers]
  },

  // Processos Disponíveis
  getAvailableProcesses: () => availableProcesses.map(p => ({ ...p })),

  // Instâncias de Processos
  getProcessInstances: () => processInstances.map(p => {
    const pit = processInstanceTasks.find(t => t.process_instance_id === p.id && t.task_id === 1)
    const answers = pit ? formAnswers[pit.id] : null
    const methodName = answers ? answers["1"] : null
    return {
      ...p,
      methodName: methodName || null
    }
  }),
  addProcessInstance: (instance) => {
    const newId = processInstances.length > 0 ? Math.max(...processInstances.map(p => p.id)) + 1 : 1
    const newInstance = { 
      id: newId, 
      createdAt: new Date().toISOString(), 
      ...instance 
    }
    processInstances.push(newInstance)

    const creatorUser = users.find(u => u.id === Number(instance.created_by))
    addAuditLog(newId, "Criar Método", `Instância do método de validação criada e inicializada por ${creatorUser?.name || 'usuário'}.`, "Inicialização")

    // Quem cria sempre ganha automaticamente o cargo de "Proponente"
    let currentRoleId = processInstanceRoles.length > 0 ? Math.max(...processInstanceRoles.map(r => r.id)) + 1 : 1
    const newRole = {
      id: currentRoleId++,
      instance_id: newId,
      user_id: instance.created_by,
      role: 'Proponente'
    }
    processInstanceRoles.push(newRole)

    // Os administradores são adicionados como "BraCVAM"
    const adminUsers = users.filter(u => u.system_role === 'admin')
    adminUsers.forEach(admin => {
      processInstanceRoles.push({
        id: currentRoleId++,
        instance_id: newId,
        user_id: admin.id,
        role: 'BraCVAM'
      })
    })

    // Inicializa automaticamente as etapas da instância
    const stepsForProcess = processSteps.filter(step => step.process_id === Number(instance.process_id))
    const createdStepInstances = []
    stepsForProcess.forEach(step => {
      const newStepInstanceId = processInstanceSteps.length > 0 ? Math.max(...processInstanceSteps.map(s => s.id)) + 1 : 1
      const newStepInstance = {
        id: newStepInstanceId,
        process_instance_id: newId,
        step_id: step.id,
        is_completed: false
      }
      processInstanceSteps.push(newStepInstance)
      createdStepInstances.push(newStepInstance)
    })

    // Buscar a etapa com sequence: 1 em process_steps
    const stepSequence1 = stepsForProcess.find(step => step.sequence === 1)
    if (stepSequence1) {
      const stepInstanceSequence1 = createdStepInstances.find(si => si.step_id === stepSequence1.id)
      if (stepInstanceSequence1) {
        // Buscar os registros em tasks utilizando o id da etapa (step_id)
        const tasksForStep1 = tasks.filter(t => t.step_id === stepSequence1.id)
        // Inserir os registros em process_instance_tasks com is_completed: false
        tasksForStep1.forEach(task => {
          const newInstanceTaskId = processInstanceTasks.length > 0 ? Math.max(...processInstanceTasks.map(pit => pit.id)) + 1 : 1
          processInstanceTasks.push({
            id: newInstanceTaskId,
            process_instance_id: newId,
            process_instance_step_id: stepInstanceSequence1.id,
            task_id: task.id,
            is_completed: false,
            status: task.type === 'form' ? 'pending_submission' : 'pending',
            current_reviewer_role: null,
            current_review_round_id: task.type === 'form' ? 1 : null,
            editable: task.type === 'form' ? true : false
          })
        })
      }
    }

    return { ...newInstance }
  },

  // Cargos dos Processos
  getProcessInstanceRoles: () => processInstanceRoles.map(r => ({ ...r })),

  // Etapas dos Processos
  getProcessSteps: () => processSteps.map(s => ({ ...s })),

  // Instâncias de Etapas dos Processos
  getProcessInstanceSteps: () => processInstanceSteps.map(s => ({ ...s })),
  getProcessInstanceStepsByInstanceId: (instanceId) => 
    processInstanceSteps.filter(s => String(s.process_instance_id) === String(instanceId)).map(s => ({ ...s })),
  toggleProcessInstanceStep: (stepInstanceId, isCompleted) => {
    const step = processInstanceSteps.find(s => s.id === Number(stepInstanceId))
    if (step) {
      step.is_completed = isCompleted
    }
    return step ? { ...step } : null
  },

  // Tarefas (Tasks)
  getTasks: () => tasks.map(t => ({ ...t })),
  getProcessInstanceTasks: () => processInstanceTasks.map(t => ({ ...t })),
  toggleProcessInstanceTask: (taskInstanceId, isCompleted) => {
    const pit = processInstanceTasks.find(t => t.id === Number(taskInstanceId))
    if (!pit) return null

    pit.is_completed = isCompleted

    const taskDef = tasks.find(t => t.id === pit.task_id)
    const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
    const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
    const statusText = isCompleted ? "concluída" : "reaberta"
    addAuditLog(pit.process_instance_id, isCompleted ? "Concluir Tarefa" : "Reabrir Tarefa", `Tarefa '${taskDef?.name}' foi ${statusText}.`, stepDef?.name || "Geral")

    const stepInstanceId = pit.process_instance_step_id
    if (isCompleted) {
      checkAndCompleteStep(stepInstanceId)
    } else {
      const stepInstance = processInstanceSteps.find(s => s.id === stepInstanceId)
      if (stepInstance) {
        stepInstance.is_completed = false
      }
    }

    return { ...pit }
  },

  // Revisões de Campos
  getFieldReviews: () => fieldReviews.map(r => ({ ...r })),
  addFieldReview: (review) => {
    const newId = fieldReviews.length > 0 ? Math.max(...fieldReviews.map(r => r.id)) + 1 : 1
    const newReview = {
      id: newId,
      status: 'active',
      ...review
    }
    fieldReviews.push(newReview)
    return { ...newReview }
  },

  // Ciclo de Submissão de Formulário e Revisão
  submitFormTask: (instanceTaskId, answers) => {
    const pit = processInstanceTasks.find(t => t.id === Number(instanceTaskId))
    if (!pit) return null

    // Salva as respostas
    formAnswers[instanceTaskId] = { ...answers }

    // Marca todos os apontamentos da rodada anterior como resolvidos
    fieldReviews.forEach(r => {
      if (r.process_instance_id === pit.process_instance_id && r.status === 'active') {
        r.status = 'resolved'
      }
    })

    // Atualiza status e trava edição
    pit.status = 'analyzing_ai'
    pit.editable = false

    const taskDef = tasks.find(t => t.id === pit.task_id)
    const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
    const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
    addAuditLog(pit.process_instance_id, "Submeter Formulário", `Formulário da tarefa '${taskDef?.name}' preenchido e submetido para avaliação.`, stepDef?.name || "Geral")

    return { ...pit }
  },

  runAIEvaluation: (instanceTaskId) => {
    const pit = processInstanceTasks.find(t => t.id === Number(instanceTaskId))
    if (!pit) return null

    const taskDef = tasks.find(t => t.id === pit.task_id)
    const answers = formAnswers[instanceTaskId] || {}
    const fieldsForTask = formFields.filter(f => f.task_id === pit.task_id)

    let hasAIFailures = false

    // Avalia campos conforme estratégia
    fieldsForTask.forEach(field => {
      if (field.ai_evaluation?.enabled) {
        const val = answers[field.id]
        const strategy = field.ai_evaluation.strategy

        let failed = false
        let aiComment = ''

        if (strategy === 'match_regulatory_keywords') {
          const keywords = ['redução', 'reducao', 'substituição', 'substituicao', '3rs', 'regulação', 'regulacao', 'diretrizes']
          const valStr = String(val || '').toLowerCase()
          const hasKeywords = keywords.some(kw => valStr.includes(kw))
          if (!valStr || valStr.length < 15 || !hasKeywords) {
            failed = true
            aiComment = 'A descrição do princípio regulatório de Redução ou Substituição precisa conter termos regulatórios explícitos (ex: redução, substituição, 3Rs) e ser detalhada.'
          }
        } else if (strategy === 'verify_pdf_structure') {
          const fileName = String(val || '').toLowerCase()
          if (!fileName || !fileName.endsWith('.pdf') || !fileName.includes('pop')) {
            failed = true
            aiComment = 'O arquivo do Procedimento Operacional Padrão (POP) precisa ser um documento PDF contendo "pop" no nome para validação estrutural.'
          }
        } else if (strategy === 'verify_desenho_pdf') {
          const fileName = String(val || '').toLowerCase()
          if (!fileName || !fileName.endsWith('.pdf') || (!fileName.includes('desenho') && !fileName.includes('estudo'))) {
            failed = true
            aiComment = 'O arquivo de Desenho do Estudo precisa ser um documento PDF contendo "desenho" ou "estudo" no nome.'
          }
        } else if (strategy === 'verify_criterios_pdf') {
          const fileName = String(val || '').toLowerCase()
          if (!fileName || !fileName.endsWith('.pdf') || (!fileName.includes('criterio') && !fileName.includes('aceitacao') && !fileName.includes('aceitac'))) {
            failed = true
            aiComment = 'O arquivo de Critérios de Aceitação precisa ser um documento PDF contendo "criterio" ou "aceitacao" no nome.'
          }
        } else if (strategy === 'verify_plano_pdf') {
          const fileName = String(val || '').toLowerCase()
          if (!fileName || !fileName.endsWith('.pdf') || (!fileName.includes('plano') && !fileName.includes('estatistico') && !fileName.includes('estatistic'))) {
            failed = true
            aiComment = 'O arquivo de Plano Estatístico precisa ser um documento PDF contendo "plano" ou "estatistico" no nome.'
          }
        } else if (strategy === 'verify_erros_pdf') {
          const fileName = String(val || '').toLowerCase()
          if (!fileName || !fileName.endsWith('.pdf') || (!fileName.includes('erro') && !fileName.includes('possibilidade'))) {
            failed = true
            aiComment = 'O arquivo de Possibilidade de Erros precisa ser um documento PDF contendo "erro" ou "possibilidade" no nome.'
          }
        }

        if (failed) {
          hasAIFailures = true
          const newReviewId = fieldReviews.length > 0 ? Math.max(...fieldReviews.map(r => r.id)) + 1 : 1
          fieldReviews.push({
            id: newReviewId,
            process_instance_id: pit.process_instance_id,
            review_round_id: pit.current_review_round_id || 1,
            field_id: field.id,
            reviewer_role: 'ia',
            comment: aiComment,
            status: 'active'
          })
        }
      }
    })

    const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
    const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
    const newId = auditLogs.length > 0 ? Math.max(...auditLogs.map(l => l.id)) + 1 : 1
    auditLogs.push({
      id: newId,
      process_instance_id: pit.process_instance_id,
      user_id: 0,
      user_name: "Inteligência Artificial (Validador)",
      user_email: "ia@bracvam.gov.br",
      action: "Avaliação de IA",
      description: hasAIFailures 
        ? `Avaliação automática da tarefa '${taskDef?.name}' identificou não-conformidades.`
        : `Avaliação automática da tarefa '${taskDef?.name}' realizada com sucesso sem inconformidades.`,
      where_context: stepDef?.name || "Geral",
      timestamp: new Date().toISOString()
    })

    if (hasAIFailures) {
      // Se a IA encontrar algum problema, o formulário retorna ao proponente
      pit.status = 'pending_submission'
      pit.editable = true
      pit.current_reviewer_role = null
      
      if (pit.current_review_round_id) {
        pit.current_review_round_id += 1
      } else {
        pit.current_review_round_id = 1
      }
    } else {
      const reviewers = taskDef.required_reviewers || []
      if (reviewers.length > 0) {
        pit.status = 'pending_review'
        pit.current_reviewer_role = reviewers[0]
      } else {
        pit.status = 'completed'
        pit.is_completed = true
        pit.editable = false
        pit.current_reviewer_role = null
        checkAndCompleteStep(pit.process_instance_step_id)
      }
    }

    return { ...pit }
  },

  acceptReview: (instanceTaskId) => {
    const pit = processInstanceTasks.find(t => t.id === Number(instanceTaskId))
    if (!pit) return null

    const taskDef = tasks.find(t => t.id === pit.task_id)
    const reviewers = taskDef.required_reviewers || []
    const currentIndex = reviewers.indexOf(pit.current_reviewer_role)

    const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
    const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
    addAuditLog(pit.process_instance_id, "Aprovar Revisão", `Revisão da tarefa '${taskDef?.name}' aceita e aprovada.`, stepDef?.name || "Geral")

    if (currentIndex !== -1 && currentIndex < reviewers.length - 1) {
      pit.current_reviewer_role = reviewers[currentIndex + 1]
      pit.status = 'pending_review'
    } else {
      pit.status = 'completed'
      pit.is_completed = true
      pit.editable = false
      pit.current_reviewer_role = null
      checkAndCompleteStep(pit.process_instance_step_id)
    }

    return { ...pit }
  },

  rejectReview: (instanceTaskId) => {
    const pit = processInstanceTasks.find(t => t.id === Number(instanceTaskId))
    if (!pit) return null

    const taskDef = tasks.find(t => t.id === pit.task_id)
    const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
    const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
    addAuditLog(pit.process_instance_id, "Rejeitar Revisão", `Revisão da tarefa '${taskDef?.name}' rejeitada. Retornada para correção.`, stepDef?.name || "Geral")

    pit.status = 'pending_submission'
    pit.editable = true
    pit.current_reviewer_role = null
    
    if (pit.current_review_round_id) {
      pit.current_review_round_id += 1
    } else {
      pit.current_review_round_id = 1
    }

    return { ...pit }
  },

  // Campos de Formulário Dinâmicos
  getFormFieldsByTaskId: (taskId) => formFields.filter(f => Number(f.task_id) === Number(taskId)).map(f => ({ ...f })),
  getFormAnswers: (instanceTaskId) => {
    return formAnswers[instanceTaskId] ? { ...formAnswers[instanceTaskId] } : {}
  },
  saveFormAnswers: (instanceTaskId, answers) => {
    formAnswers[instanceTaskId] = { ...answers }
    return { ...formAnswers[instanceTaskId] }
  },

  // Convites Pendentes
  getPendingInvites: () => pendingInvites.map(i => ({ ...i })),

  registerUser: (userData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      system_role: 'default'
    }
    users.push(newUser)

    // Converte convites pendentes associados
    pendingInvites.forEach(invite => {
      if (invite.email.toLowerCase() === userData.email.toLowerCase() && invite.status === 'sent') {
        let currentRoleId = processInstanceRoles.length > 0 ? Math.max(...processInstanceRoles.map(r => r.id)) + 1 : 1
        processInstanceRoles.push({
          id: currentRoleId,
          instance_id: invite.process_instance_id,
          user_id: newId,
          role: invite.target_role
        })
        invite.status = 'accepted'
      }
    })

    return { ...newUser }
  },

  completeAssignmentTask: (taskInstanceId, assignments) => {
    const pit = processInstanceTasks.find(t => t.id === Number(taskInstanceId))
    if (!pit) return null

    const taskDef = tasks.find(t => t.id === pit.task_id)
    if (!taskDef) return null

    const targetRole = taskDef.target_role

    assignments.forEach(assign => {
      if (assign.userId) {
        // Usuário existente
        let currentRoleId = processInstanceRoles.length > 0 ? Math.max(...processInstanceRoles.map(r => r.id)) + 1 : 1
        processInstanceRoles.push({
          id: currentRoleId,
          instance_id: pit.process_instance_id,
          user_id: Number(assign.userId),
          role: targetRole
        })
      } else if (assign.email) {
        // Verificar se o email é de um usuário existente
        const existingUser = users.find(u => u.email.toLowerCase() === assign.email.toLowerCase())
        if (existingUser) {
          let currentRoleId = processInstanceRoles.length > 0 ? Math.max(...processInstanceRoles.map(r => r.id)) + 1 : 1
          processInstanceRoles.push({
            id: currentRoleId,
            instance_id: pit.process_instance_id,
            user_id: existingUser.id,
            role: targetRole
          })
        } else {
          // Criar convite pendente
          let currentInviteId = pendingInvites.length > 0 ? Math.max(...pendingInvites.map(i => i.id)) + 1 : 1
          pendingInvites.push({
            id: currentInviteId,
            process_instance_id: pit.process_instance_id,
            email: assign.email,
            target_role: targetRole,
            status: 'sent'
          })
        }
      }
    })

    pit.is_completed = true
    pit.status = 'completed'

    checkAndCompleteStep(pit.process_instance_step_id)

    const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
    const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
    const targetsText = assignments.map(a => a.email || users.find(u => u.id === Number(a.userId))?.name || "Usuário").join(', ')
    addAuditLog(pit.process_instance_id, "Atribuir Cargo", `Cargo '${taskDef?.target_role}' atribuído a: ${targetsText}.`, stepDef?.name || "Geral")

    return { ...pit }
  },

  // Amostras (Sample Definitions & Blind Codes)
  getSampleDefinitions: (instanceId) => {
    return sampleDefinitions.filter(s => Number(s.process_instance_id) === Number(instanceId)).map(s => ({ ...s }))
  },

  getSampleBlindCodes: (instanceId) => {
    return sampleBlindCodes.filter(bc => Number(bc.process_instance_id) === Number(instanceId)).map(bc => ({ ...bc }))
  },

  saveSampleDefinitions: (instanceId, samples) => {
    const otherSamples = sampleDefinitions.filter(s => Number(s.process_instance_id) !== Number(instanceId))
    let nextId = sampleDefinitions.length > 0 ? Math.max(...sampleDefinitions.map(s => s.id)) + 1 : 1
    
    const processedSamples = samples.map(s => {
      const id = s.id ? Number(s.id) : nextId++
      return {
        ...s,
        id,
        process_instance_id: Number(instanceId)
      }
    })
    
    sampleDefinitions = [...otherSamples, ...processedSamples]
    
    const labRoles = processInstanceRoles.filter(
      r => Number(r.instance_id) === Number(instanceId) && r.role === 'Laboratórios Participantes'
    )
    
    const activeSampleIds = processedSamples.map(s => s.id)
    const activeLabRoleIds = labRoles.map(l => l.id)
    
    // Clean up old blind codes for deleted samples or unassigned/deleted lab roles
    sampleBlindCodes = sampleBlindCodes.filter(bc => {
      if (Number(bc.process_instance_id) !== Number(instanceId)) return true
      return activeSampleIds.includes(bc.sample_id) && activeLabRoleIds.includes(bc.laboratory_role_id)
    })
    
    // Ensure blind codes exist for all active samples & laboratory roles
    const currentBatchCodes = []
    processedSamples.forEach(sample => {
      labRoles.forEach(lab => {
        const existingCodeObj = sampleBlindCodes.find(
          bc => Number(bc.sample_id) === Number(sample.id) && Number(bc.laboratory_role_id) === Number(lab.id)
        )
        if (!existingCodeObj) {
          const blind_code = getUniqueBlindCodeForInstance(Number(instanceId), currentBatchCodes)
          currentBatchCodes.push(blind_code)
          const newCodeId = sampleBlindCodes.length > 0 ? Math.max(...sampleBlindCodes.map(bc => bc.id)) + 1 : 1
          sampleBlindCodes.push({
            id: newCodeId,
            process_instance_id: Number(instanceId),
            sample_id: sample.id,
            laboratory_role_id: lab.id,
            blind_code
          })
        }
      })
    })
    
    addAuditLog(Number(instanceId), "Definir Amostras", "Cadastro de substâncias químicas de teste e códigos cegos atualizado.", "Definição de Amostras")

    return processedSamples.map(s => ({ ...s }))
  },

  // Templates de Coleta de Dados
  getDataTemplates: (instanceId) => {
    return dataTemplates.filter(t => Number(t.process_instance_id) === Number(instanceId)).map(t => ({ ...t }))
  },

  getDataTemplateColumns: (templateId) => {
    const template = dataTemplates.find(t => t.id === Number(templateId))
    if (!template) return []
    const userCols = dataTemplateColumns.filter(c => Number(c.template_id) === Number(templateId)).map(c => ({ ...c }))
    const systemCols = getSystemColumnsForTemplate(template).map(sc => ({
      id: `sys-${templateId}-${sc.name}`,
      template_id: Number(templateId),
      ...sc
    }))
    return [...userCols, ...systemCols].sort((a, b) => a.position - b.position)
  },

  deleteDataTemplate: (templateId) => {
    const template = dataTemplates.find(t => t.id === Number(templateId))
    if (template) {
      addAuditLog(Number(template.process_instance_id), "Remover Template de Coleta", `Template de coleta de dados estatísticos '${template.name}' excluído.`, "Modelagem de Dados")
    }
    dataTemplates = dataTemplates.filter(t => t.id !== Number(templateId))
    dataTemplateColumns = dataTemplateColumns.filter(c => Number(c.template_id) !== Number(templateId))
    return true
  },

  saveDataTemplate: (instanceId, template, columns) => {
    let templateId = template.id ? Number(template.id) : null
    if (!templateId) {
      templateId = dataTemplates.length > 0 ? Math.max(...dataTemplates.map(t => t.id)) + 1 : 1
      dataTemplates.push({
        ...template,
        id: templateId,
        process_instance_id: Number(instanceId)
      })
    } else {
      const index = dataTemplates.findIndex(t => t.id === templateId)
      if (index !== -1) {
        dataTemplates[index] = {
          ...dataTemplates[index],
          ...template,
          process_instance_id: Number(instanceId)
        }
      }
    }

    const userCols = columns.filter(c => !c.is_system && !String(c.id).startsWith('sys-'))

    // Validations
    const names = userCols.map(c => c.name.trim().toLowerCase())
    const hasDuplicatedNames = names.some((val, i) => names.indexOf(val) !== i)
    if (hasDuplicatedNames) {
      throw new Error("Nomes de colunas não podem ser duplicados.")
    }

    const systemNames = ["laboratory_id", "operator_name", "data_entry_user", "experiment_date", "data_entry_date", "execution_status"]
    const conflictsWithSystem = names.some(n => systemNames.includes(n))
    if (conflictsWithSystem) {
      throw new Error("Colunas customizadas não podem usar nomes reservados do sistema.")
    }

    const hasEmptyNames = userCols.some(c => !c.name || !c.name.trim())
    if (hasEmptyNames) {
      throw new Error("Todas as colunas devem possuir um identificador válido (nome).")
    }

    const positions = userCols.map(c => Number(c.position))
    const hasDuplicatedPositions = positions.some((val, i) => positions.indexOf(val) !== i)
    if (hasDuplicatedPositions) {
      throw new Error("Posições de colunas não podem ser duplicadas.")
    }

    // Derived data validation
    const allAvailableColumnNames = [...names, ...systemNames]
    userCols.forEach(c => {
      if (c.is_derived_data) {
        if (!c.source_columns || c.source_columns.length === 0) {
          throw new Error(`A coluna derivada "${c.name}" precisa de pelo menos uma coluna de origem.`)
        }
        c.source_columns.forEach(sc => {
          if (!allAvailableColumnNames.includes(sc.trim().toLowerCase())) {
            throw new Error(`A coluna de origem "${sc}" definida em "${c.name}" não existe.`)
          }
        })
      }
    })

    // Save columns
    dataTemplateColumns = dataTemplateColumns.filter(c => Number(c.template_id) !== templateId)
    let nextColId = dataTemplateColumns.length > 0 ? Math.max(...dataTemplateColumns.map(c => c.id)) + 1 : 1
    const processedCols = userCols.map(c => {
      const id = (c.id && !String(c.id).startsWith('temp-') && !String(c.id).startsWith('sys-')) ? Number(c.id) : nextColId++
      return {
        ...c,
        id,
        template_id: templateId
      }
    })

    dataTemplateColumns = [...dataTemplateColumns, ...processedCols]

    addAuditLog(Number(instanceId), "Definir Template de Coleta", `Template de coleta de dados estatísticos '${template.name}' configurado e salvo.`, "Modelagem de Dados")

    return {
      template: dataTemplates.find(t => t.id === templateId),
      columns: processedCols
    }
  },

  // Audit Logs
  getAuditLogs: () => auditLogs.map(l => ({ ...l })),
  getAuditLogsByInstanceId: (instanceId) =>
    auditLogs.filter(l => Number(l.process_instance_id) === Number(instanceId)).map(l => ({ ...l })),

  // Opiniões ADHOC
  getAdhocOpinions: (instanceId) => adhocOpinions.filter(o => Number(o.process_instance_id) === Number(instanceId)).map(o => ({ ...o })),
  saveAdhocOpinion: (instanceId, opinion) => {
    const currentUser = getCurrentUser() || { id: 13, name: 'Marcos Comitê ADHOC' }
    const index = adhocOpinions.findIndex(o => Number(o.process_instance_id) === Number(instanceId) && Number(o.user_id) === Number(currentUser.id))
    const opinionData = {
      process_instance_id: Number(instanceId),
      user_id: currentUser.id,
      user_name: currentUser.name,
      technical_observations: opinion.technical_observations,
      preliminary_decision: opinion.preliminary_decision,
      createdAt: new Date().toISOString()
    }
    if (index !== -1) {
      adhocOpinions[index] = { ...adhocOpinions[index], ...opinionData }
    } else {
      const newId = adhocOpinions.length > 0 ? Math.max(...adhocOpinions.map(o => o.id)) + 1 : 1
      adhocOpinions.push({ id: newId, ...opinionData })
    }
    
    // Completa a tarefa 17
    const pit = processInstanceTasks.find(t => Number(t.process_instance_id) === Number(instanceId) && t.task_id === 17)
    if (pit) {
      pit.is_completed = true
      pit.status = 'completed'
      pit.editable = false
      
      // Libera a tarefa 18
      const pit18 = processInstanceTasks.find(t => Number(t.process_instance_id) === Number(instanceId) && t.task_id === 18)
      if (pit18) {
        pit18.editable = true
      }
      
      const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
      const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
      addAuditLog(instanceId, "Emitir Parecer ADHOC", `Parecer independente emitido pelo especialista ${currentUser.name} com decisão preliminar: ${opinion.preliminary_decision}.`, stepDef?.name || "Revisão e Decisão")
    }

    return opinionData
  },

  // Consolidações do Grupo Gestor
  getGestorConsolidations: (instanceId) => gestorConsolidations.filter(c => Number(c.process_instance_id) === Number(instanceId)).map(c => ({ ...c })),
  saveGestorConsolidation: (instanceId, consolidation) => {
    const index = gestorConsolidations.findIndex(c => Number(c.process_instance_id) === Number(instanceId))
    const consolidationData = {
      process_instance_id: Number(instanceId),
      discussion_notes: consolidation.discussion_notes,
      divergences: consolidation.divergences,
      methodological_limitations: consolidation.methodological_limitations,
      documentation_needs: consolidation.documentation_needs,
      adjustments_requested: consolidation.adjustments_requested || [],
      createdAt: new Date().toISOString()
    }
    if (index !== -1) {
      gestorConsolidations[index] = { ...gestorConsolidations[index], ...consolidationData }
    } else {
      const newId = gestorConsolidations.length > 0 ? Math.max(...gestorConsolidations.map(c => c.id)) + 1 : 1
      gestorConsolidations.push({ id: newId, ...consolidationData })
    }

    const pit = processInstanceTasks.find(t => Number(t.process_instance_id) === Number(instanceId) && t.task_id === 18)
    if (pit) {
      pit.is_completed = true
      pit.status = 'completed'
      pit.editable = false
      
      // Libera a tarefa 19
      const pit19 = processInstanceTasks.find(t => Number(t.process_instance_id) === Number(instanceId) && t.task_id === 19)
      if (pit19) {
        pit19.editable = true
      }
      
      const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
      const stepDef = processSteps.find(s => s.id === stepInstance?.step_id)
      addAuditLog(instanceId, "Salvar Consolidação Técnica", `Consolidação técnica entre Comitê ADHOC e Grupo Gestor salva pelo Grupo Gestor.`, stepDef?.name || "Revisão e Decisão")
    }

    return consolidationData
  },

  // Deliberações Finais
  getFinalDeliberations: (instanceId) => finalDeliberations.filter(d => Number(d.process_instance_id) === Number(instanceId)).map(d => ({ ...d })),
  saveFinalDeliberation: (instanceId, deliberation) => {
    const index = finalDeliberations.findIndex(d => Number(d.process_instance_id) === Number(instanceId))
    const deliberationData = {
      process_instance_id: Number(instanceId),
      final_decision: deliberation.final_decision,
      institutional_opinion: deliberation.institutional_opinion,
      institutional_approval: deliberation.institutional_approval || false,
      official_documentation: deliberation.official_documentation || '',
      regulatory_recommendation: deliberation.regulatory_recommendation || '',
      published_at: deliberation.is_published ? new Date().toISOString() : null,
      is_published: deliberation.is_published || false
    }
    if (index !== -1) {
      finalDeliberations[index] = { ...finalDeliberations[index], ...deliberationData }
    } else {
      const newId = finalDeliberations.length > 0 ? Math.max(...finalDeliberations.map(d => d.id)) + 1 : 1
      finalDeliberations.push({ id: newId, ...deliberationData })
    }

    const pit = processInstanceTasks.find(t => Number(t.process_instance_id) === Number(instanceId) && t.task_id === 19)
    if (pit && deliberation.is_published) {
      pit.is_completed = true
      pit.status = 'completed'
      pit.editable = false
      
      const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
      if (stepInstance) {
        stepInstance.is_completed = true // Fecha a etapa de Revisão e Decisão
      }
      addAuditLog(instanceId, "Publicar Deliberação Final", `Validação concluída e publicada oficialmente com decisão final: ${deliberation.final_decision}.`, "Revisão e Decisão")
    }

    return deliberationData
  }
}


const getSystemColumnsForTemplate = (template) => {
  const cols = [
    { name: "laboratory_id", label: "ID do Laboratório", type: "integer", required: true, is_system: true, position: 1000 },
    { name: "operator_name", label: "Nome do Operador", type: "text", required: true, is_system: true, position: 1001 },
    { name: "data_entry_user", label: "Digitador dos Dados", type: "text", required: true, is_system: true, position: 1002 },
    { name: "experiment_date", label: "Data do Experimento", type: "date", required: true, is_system: true, position: 1003 },
    { name: "data_entry_date", label: "Data da Digitação", type: "datetime", required: true, is_system: true, position: 1004 }
  ]
  if (template.allow_failed_runs) {
    cols.push({
      name: "execution_status",
      label: "Status de Execução",
      type: "select",
      required: true,
      options: ["completed", "failed", "aborted"],
      is_system: true,
      position: 1005
    })
  }
  return cols
}

const generateRandomCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const randChar = (set) => set[Math.floor(Math.random() * set.length)]
  const randStr = (set, len) => Array.from({ length: len }, () => randChar(set)).join('')
  const formats = [
    () => `${randStr(letters, 2)}-${randStr(digits, 4)}-${randStr(letters, 1)}`,
    () => `${randStr(digits, 3)}-${randStr(letters, 2)}-${randStr(digits, 3)}`,
    () => `${randStr(letters, 1)}${randStr(digits, 3)}${randStr(letters, 1)}${randStr(digits, 3)}`
  ]
  const formatIndex = Math.floor(Math.random() * formats.length)
  return formats[formatIndex]()
}

const getUniqueBlindCodeForInstance = (instanceId, currentBatchCodes = []) => {
  const existingCodes = [
    ...sampleBlindCodes.filter(bc => Number(bc.process_instance_id) === Number(instanceId)).map(bc => bc.blind_code),
    ...currentBatchCodes
  ]
  let attempts = 0
  while (attempts < 1000) {
    const candidate = generateRandomCode()
    if (!existingCodes.includes(candidate)) {
      return candidate
    }
    attempts++
  }
  throw new Error("Could not generate a unique blind code")
}



