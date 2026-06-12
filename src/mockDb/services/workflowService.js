import * as taskInstanceRepository from '../repositories/taskInstanceRepository'
import * as taskRepository from '../repositories/taskRepository'
import * as stageRepository from '../repositories/stageRepository'
import * as processRepository from '../repositories/processRepository'
import * as eventRepository from '../repositories/eventRepository'
import * as feedbackRepository from '../repositories/feedbackRepository'
import * as commentRepository from '../repositories/commentRepository'
import { nextId } from '../repositories/baseRepository'
import { db } from '../database'

export async function logEvent(processId, userId, type, description) {
  return eventRepository.create({
    process_instance_id: processId,
    user_id: userId,
    event_type: type,
    description
  })
}

async function advanceWorkflowAfterCompletion(taskInstance, currentTask, userId) {
  const stageInstance = db.stageInstances.find(si => si.id === taskInstance.stage_instance_id)
  const processInstance = db.processInstances.find(pi => pi.id === stageInstance.process_instance_id)

  // Se for a tarefa 3 (Resumo e Submissão), registrar evento de submissão
  if (currentTask.id === 3) {
    await logEvent(processInstance.id, userId, 'submission', 'Processo submetido para avaliação preliminar automatizada.')
  }

  // Se for a tarefa 5 (Aprovação BRACVAM), registrar aprovação
  if (currentTask.id === 5) {
    await logEvent(processInstance.id, userId, 'approval', 'Etapa de Submissão e Triagem aprovada pela BRACVAM.')
  }

  // 2. Encontrar a próxima tarefa do processo que está bloqueada
  const processTaskInstances = taskInstanceRepository.findByProcess(processInstance.id)
  const allTasks = taskRepository.findTasksByStage(currentTask.stage_id)
  const nextTaskDef = allTasks.find(t => t.sort_order > currentTask.sort_order)

  if (nextTaskDef) {
    const nextTaskInstance = processTaskInstances.find(ti => ti.task_id === nextTaskDef.id)
    if (nextTaskInstance) {
      taskInstanceRepository.update(nextTaskInstance.id, {
        status: 'pending',
        started_at: new Date().toISOString()
      })
    }

    processRepository.update(processInstance.id, {
      current_task_id: nextTaskDef.id,
      updated_at: new Date().toISOString()
    })

    return { nextTaskId: nextTaskInstance?.id, finished: false }
  } else {
    // Não há mais tarefas nesta etapa
    stageRepository.updateStageInstance(stageInstance.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })

    const allStages = stageRepository.findStagesByProcessType(processInstance.process_type_id)
    const currentStageObj = stageRepository.findStageById(stageInstance.stage_id)
    const nextStageDef = allStages.find(s => s.sort_order > currentStageObj.sort_order)

    if (nextStageDef) {
      const nextStageInstanceId = nextId(db.stageInstances)
      stageRepository.createStageInstance({
        id: nextStageInstanceId,
        process_instance_id: processInstance.id,
        stage_id: nextStageDef.id,
        status: 'active',
        started_at: new Date().toISOString(),
        completed_at: null
      })

      const nextStageTasks = taskRepository.findTasksByStage(nextStageDef.id)
      
      nextStageTasks.forEach((tDef, idx) => {
        taskInstanceRepository.create({
          stage_instance_id: nextStageInstanceId,
          process_instance_id: processInstance.id,
          task_id: tDef.id,
          status: idx === 0 ? 'pending' : 'locked',
          started_at: idx === 0 ? new Date().toISOString() : null,
          completed_at: null
        })
      })

      const firstTaskOfNextStage = nextStageTasks[0]
      processRepository.update(processInstance.id, {
        current_stage_id: nextStageDef.id,
        current_task_id: firstTaskOfNextStage ? firstTaskOfNextStage.id : null,
        updated_at: new Date().toISOString()
      })

      await logEvent(processInstance.id, userId, 'stage_completed', `Etapa "${currentStageObj.name}" concluída. Transição para etapa "${nextStageDef.name}".`)
    } else {
      processRepository.update(processInstance.id, {
        status: 'completed',
        current_task_id: null,
        updated_at: new Date().toISOString()
      })
      await logEvent(processInstance.id, userId, 'process_completed', 'Processo de validação concluído.')
    }

    return { finished: true }
  }
}

export async function completeTask(taskInstanceId, userId) {
  const taskInstance = db.taskInstances.find(ti => ti.id === taskInstanceId)
  if (!taskInstance) throw new Error('Instância de tarefa não encontrada')

  const stageInstance = db.stageInstances.find(si => si.id === taskInstance.stage_instance_id)
  const processInstance = db.processInstances.find(pi => pi.id === stageInstance.process_instance_id)
  const currentTask = taskRepository.findTaskById(taskInstance.task_id)

  // Se a tarefa exige aprovação, ela entra em estado de awaiting_approval
  if (currentTask.requires_approval) {
    taskInstanceRepository.update(taskInstanceId, {
      status: 'awaiting_approval',
      submitted_at: new Date().toISOString()
    })

    await logEvent(processInstance.id, userId, 'task_submitted', `Tarefa "${currentTask.name}" enviada para aprovação.`)

    return { status: 'awaiting_approval', finished: false }
  }

  // 1. Marcar tarefa atual como concluída
  taskInstanceRepository.update(taskInstanceId, {
    status: 'completed',
    completed_at: new Date().toISOString()
  })

  // Log completion event
  await logEvent(processInstance.id, userId, 'task_completed', `Tarefa "${currentTask.name}" concluída.`)

  return advanceWorkflowAfterCompletion(taskInstance, currentTask, userId)
}

export async function approveTask(taskInstanceId, userId) {
  const taskInstance = db.taskInstances.find(ti => ti.id === taskInstanceId)
  if (!taskInstance) throw new Error('Instância de tarefa não encontrada')

  const stageInstance = db.stageInstances.find(si => si.id === taskInstance.stage_instance_id)
  const processInstance = db.processInstances.find(pi => pi.id === stageInstance.process_instance_id)
  const currentTask = taskRepository.findTaskById(taskInstance.task_id)

  taskInstanceRepository.update(taskInstanceId, {
    status: 'completed',
    completed_at: new Date().toISOString()
  })

  await logEvent(processInstance.id, userId, 'task_approved', `Tarefa "${currentTask.name}" aprovada.`)

  return advanceWorkflowAfterCompletion(taskInstance, currentTask, userId)
}

export async function rejectTask(taskInstanceId, userId, commentText) {
  const taskInstance = db.taskInstances.find(ti => ti.id === taskInstanceId)
  if (!taskInstance) throw new Error('Instância de tarefa não encontrada')

  const stageInstance = db.stageInstances.find(si => si.id === taskInstance.stage_instance_id)
  const processInstance = db.processInstances.find(pi => pi.id === stageInstance.process_instance_id)
  const currentTask = taskRepository.findTaskById(taskInstance.task_id)

  taskInstanceRepository.update(taskInstanceId, {
    status: 'rejected',
    completed_at: null
  })

  await logEvent(processInstance.id, userId, 'task_rejected', `Tarefa "${currentTask.name}" rejeitada.`)

  if (commentText) {
    const user = db.users.find(u => u.id === userId)
    commentRepository.create({
      task_instance_id: taskInstanceId,
      user_id: userId,
      user_name: user?.name || 'Aprovador',
      content: `Justificativa de rejeição: ${commentText}`
    })
  }

  return { status: 'rejected', finished: false }
}

export async function requestAdjustments(processId, userId) {
  const processInstance = db.processInstances.find(pi => pi.id === processId)
  if (!processInstance) throw new Error('Processo não encontrado')

  // 1. Log event
  await logEvent(processId, userId, 'adjustments_requested', 'BRACVAM solicitou ajustes no formulário devido a não-conformidades.')

  // 2. Set task to Task 1 ("Dados Gerais")
  processInstance.current_task_id = 1
  processInstance.updated_at = new Date().toISOString()

  // 3. Reset the task instances
  const stageInstance = db.stageInstances.find(si => si.process_instance_id === processId && si.status === 'active')
  if (stageInstance) {
    const processTaskInstances = taskInstanceRepository.findByProcess(processId)
    
    processTaskInstances.forEach(ti => {
      if (ti.task_id === 1) {
        taskInstanceRepository.update(ti.id, {
          status: 'pending',
          completed_at: null
        })
      } else {
        taskInstanceRepository.update(ti.id, {
          status: 'locked',
          completed_at: null
        })
        
        if (ti.task_id === 4) {
          taskInstanceRepository.update(ti.id, {
            result: null,
            reevaluated: false
          })
          feedbackRepository.deleteByTaskInstanceId(ti.id)
        }
      }
    })
  }
  return processInstance
}
