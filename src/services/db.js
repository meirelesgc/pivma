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
  }
}



