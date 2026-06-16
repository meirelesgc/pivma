import initialUsers from '../data/mock/users.json'
import initialAvailableProcesses from '../data/mock/available_processes.json'
import initialProcessInstances from '../data/mock/process_instances.json'
import initialProcessInstanceRoles from '../data/mock/process_instance_roles.json'
import initialProcessSteps from '../data/mock/process_steps.json'
import initialProcessInstanceSteps from '../data/mock/process_instance_steps.json'
import initialTasks from '../data/mock/tasks.json'
import initialProcessInstanceTasks from '../data/mock/process_instance_tasks.json'
import initialFormFields from '../data/mock/form_fields.json'

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
let formAnswers = {} // Chaveada por process_instance_task_id

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
            is_completed: false
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

    // Consultar a quantidade total de registros em process_instance_tasks com o identificador em process_instance_step_id
    const stepInstanceId = pit.process_instance_step_id
    const totalTasksForStep = processInstanceTasks.filter(t => t.process_instance_step_id === stepInstanceId)

    // Consultar a quantidade de registros do passo atual que possuem is_completed: true
    const completedTasksForStep = totalTasksForStep.filter(t => t.is_completed === true)

    // Se as quantidades forem iguais, alterar is_completed para true no registro em process_instance_steps
    if (totalTasksForStep.length > 0 && totalTasksForStep.length === completedTasksForStep.length) {
      const stepInstance = processInstanceSteps.find(s => s.id === stepInstanceId)
      if (stepInstance) {
        stepInstance.is_completed = true

        // Buscar registro em process_steps com o valor de sequence equivalente a sequence + 1
        const currentStepDef = processSteps.find(s => s.id === stepInstance.step_id)
        if (currentStepDef) {
          const nextStepDef = processSteps.find(
            s => s.process_id === currentStepDef.process_id && s.sequence === currentStepDef.sequence + 1
          )

          // Se o registro existir, repetir os passos 3 e 4 da seção "Lógica de Instanciação" utilizando o valor do id da etapa de sequence + 1
          if (nextStepDef) {
            const nextStepInstance = processInstanceSteps.find(
              s => s.process_instance_id === stepInstance.process_instance_id && s.step_id === nextStepDef.id
            )
            if (nextStepInstance) {
              // Verificar se as tarefas já foram instanciadas para evitar duplicidade
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
                    is_completed: false
                  })
                })
              }
            }
          }
        }
      }
    } else {
      // Se desmarcou uma tarefa, a etapa deixa de estar completa
      const stepInstance = processInstanceSteps.find(s => s.id === stepInstanceId)
      if (stepInstance) {
        stepInstance.is_completed = false
      }
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



