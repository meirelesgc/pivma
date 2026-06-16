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
let formAnswers = {} // Chaveada por process_instance_task_id

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
  getProcessInstances: () => processInstances.map(p => ({ ...p })),
  addProcessInstance: (instance) => {
    const newId = processInstances.length > 0 ? Math.max(...processInstances.map(p => p.id)) + 1 : 1
    const newInstance = { 
      id: newId, 
      createdAt: new Date().toISOString(), 
      ...instance 
    }
    processInstances.push(newInstance)

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

    return {
      template: dataTemplates.find(t => t.id === templateId),
      columns: processedCols
    }
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



