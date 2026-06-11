import * as taskRepository from '../repositories/taskRepository'
import * as stageRepository from '../repositories/stageRepository'
import * as processRepository from '../repositories/processRepository'
import * as eventRepository from '../repositories/eventRepository'
import * as documentRepository from '../repositories/documentRepository'
import * as commentRepository from '../repositories/commentRepository'
import { nextId } from '../repositories/baseRepository'
import { db } from '../database'

export async function getTaskDetails(taskId) {
  return taskRepository.findTaskById(taskId)
}

export async function getTaskInstance(taskInstanceId) {
  return db.taskInstances.find(ti => ti.id === taskInstanceId)
}

export async function getTaskInstanceByProcessAndTask(processId, taskId) {
  const stageInstances = db.stageInstances.filter(si => si.process_instance_id === processId)
  const stageInstanceIds = stageInstances.map(si => si.id)
  return db.taskInstances.find(ti => stageInstanceIds.includes(ti.stage_instance_id) && ti.task_id === taskId)
}

export async function completeTask(taskInstanceId, userId) {
  const taskInstance = db.taskInstances.find(ti => ti.id === taskInstanceId)
  if (!taskInstance) throw new Error('Instância de tarefa não encontrada')

  // 1. Marcar tarefa atual como concluída
  taskRepository.updateTaskInstance(taskInstanceId, {
    status: 'completed',
    completed_at: new Date().toISOString()
  })

  const stageInstance = db.stageInstances.find(si => si.id === taskInstance.stage_instance_id)
  const processInstance = db.processInstances.find(pi => pi.id === stageInstance.process_instance_id)
  
  // 2. Encontrar a próxima tarefa
  const currentTask = taskRepository.findTaskById(taskInstance.task_id)
  const allTasks = taskRepository.findTasksByStage(currentTask.stage_id)
  const nextTask = allTasks.find(t => t.sort_order > currentTask.sort_order)

  // Log completion of the specific task
  await logEvent(processInstance.id, userId, 'task_completed', `Tarefa "${currentTask.name}" concluída.`)

  // Se for a tarefa 3 (Resumo e Submissão), registrar evento de submissão
  if (currentTask.id === 3) {
    await logEvent(processInstance.id, userId, 'submission', 'Processo submetido para avaliação preliminar automatizada.')
  }

  // Se for a tarefa 5 (Aprovação BRACVAM), registrar aprovação
  if (currentTask.id === 5) {
    await logEvent(processInstance.id, userId, 'approval', 'Etapa de Submissão e Triagem aprovada pela BRACVAM.')
  }

  if (nextTask) {
    // Criar próxima TaskInstance
    const newTaskId = nextId(db.taskInstances)
    taskRepository.createTaskInstance({
      id: newTaskId,
      stage_instance_id: stageInstance.id,
      task_id: nextTask.id,
      status: 'pending',
      started_at: new Date().toISOString(),
      completed_at: null
    })

    // Atualizar ProcessInstance
    processRepository.update(processInstance.id, {
      current_task_id: nextTask.id,
      updated_at: new Date().toISOString()
    })

    return { nextTaskId: newTaskId, finished: false }
  } else {
    // Não há mais tarefas nesta etapa
    stageRepository.updateStageInstance(stageInstance.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })

    // Encontrar próxima etapa
    const allStages = stageRepository.findStagesByProcessType(processInstance.process_type_id)
    const currentStageObj = stageRepository.findStageById(stageInstance.stage_id)
    const nextStage = allStages.find(s => s.sort_order > currentStageObj.sort_order)

    if (nextStage) {
      const nextStageInstanceId = nextId(db.stageInstances)
      stageRepository.createStageInstance({
        id: nextStageInstanceId,
        process_instance_id: processInstance.id,
        stage_id: nextStage.id,
        status: 'active',
        started_at: new Date().toISOString(),
        completed_at: null
      })

      const nextStageTasks = taskRepository.findTasksByStage(nextStage.id)
      const firstTaskOfNextStage = nextStageTasks[0]

      if (firstTaskOfNextStage) {
        taskRepository.createTaskInstance({
          id: nextId(db.taskInstances),
          stage_instance_id: nextStageInstanceId,
          task_id: firstTaskOfNextStage.id,
          status: 'pending',
          started_at: new Date().toISOString(),
          completed_at: null
        })
      }

      processRepository.update(processInstance.id, {
        current_stage_id: nextStage.id,
        current_task_id: firstTaskOfNextStage ? firstTaskOfNextStage.id : null,
        updated_at: new Date().toISOString()
      })

      await logEvent(processInstance.id, userId, 'stage_completed', `Etapa "${currentStageObj.name}" concluída. Transição para etapa "${nextStage.name}".`)
    } else {
      // Processo concluído totalmente
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

export async function logEvent(processId, userId, type, description) {
  return eventRepository.create({
    process_instance_id: processId,
    user_id: userId,
    event_type: type,
    description
  })
}

export async function uploadDocument(data) {
  return documentRepository.create(data)
}

export async function getDocumentsByTaskInstance(taskInstanceId) {
  return documentRepository.findByTaskInstanceId(taskInstanceId)
}

export async function addComment(data) {
  return commentRepository.create(data)
}

export async function getCommentsByTaskInstance(taskInstanceId) {
  return commentRepository.findByTaskInstanceId(taskInstanceId)
}

export async function updateTaskInstance(taskInstanceId, data) {
  return taskRepository.updateTaskInstance(taskInstanceId, data)
}

