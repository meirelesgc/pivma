import * as processRepository from '../repositories/processRepository'
import * as stageRepository from '../repositories/stageRepository'
import * as taskRepository from '../repositories/taskRepository'
import * as participantRepository from '../repositories/participantRepository'
import * as eventRepository from '../repositories/eventRepository'
import { nextId } from '../repositories/baseRepository'
import { db } from '../database'

export async function getUserProcesses(userId) {
  const processes = processRepository.findByUserId(userId)
  const participants = participantRepository.findByUserId(userId)

  return processes.map(p => {
    const type = processRepository.findTypeById(p.process_type_id)
    const currentStage = stageRepository.findStageById(p.current_stage_id)
    const participant = participants.find(part => part.process_instance_id === p.id)

    return {
      ...p,
      type_name: type?.name || 'Tipo desconhecido',
      current_node_name: currentStage?.name || 'Etapa desconhecida', // Mantendo o nome da prop para compatibilidade
      user_role: participant?.process_role
    }
  })
}

export async function getProcessTypes() {
  return processRepository.findTypes()
}

export async function createProcess({
  processTypeId,
  userId,
  title
}) {
  const type = processRepository.findTypeById(processTypeId)
  if (!type) throw new Error('Tipo de processo não encontrado')

  // 1. Encontrar a primeira etapa e a primeira tarefa
  const stages = stageRepository.findStagesByProcessType(processTypeId)
  const firstStage = stages[0]
  if (!firstStage) throw new Error('Processo não possui etapas configuradas')

  const tasks = taskRepository.findTasksByStage(firstStage.id)
  const firstTask = tasks[0]
  if (!firstTask) throw new Error('Primeira etapa não possui tarefas configuradas')

  const processId = nextId(db.processInstances)
  
  // 2. Criar ProcessInstance
  const process = {
    id: processId,
    title,
    process_type_id: processTypeId,
    created_by: userId,
    status: 'active',
    current_stage_id: firstStage.id,
    current_task_id: firstTask.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  processRepository.create(process)

  // 3. Criar o Participante (Proponente)
  participantRepository.create({
    id: nextId(db.processParticipants),
    process_instance_id: processId,
    user_id: userId,
    process_role: 'Proponente',
    joined_at: new Date().toISOString()
  })

  // 4. Criar StageInstance Inicial
  const stageInstanceId = nextId(db.stageInstances)
  stageRepository.createStageInstance({
    id: stageInstanceId,
    process_instance_id: processId,
    stage_id: firstStage.id,
    status: 'active',
    started_at: new Date().toISOString(),
    completed_at: null
  })

  // 5. Criar TaskInstance Inicial
  taskRepository.createTaskInstance({
    id: nextId(db.taskInstances),
    stage_instance_id: stageInstanceId,
    task_id: firstTask.id,
    status: 'pending',
    started_at: new Date().toISOString(),
    completed_at: null
  })

  return process
}

export async function getProcessDetails(id) {
  const process = processRepository.findById(id)
  if (!process) return null

  const type = processRepository.findTypeById(process.process_type_id)
  const currentStage = stageRepository.findStageById(process.current_stage_id)
  const currentTask = taskRepository.findTaskById(process.current_task_id)
  
  return {
    ...process,
    type_name: type?.name,
    current_stage_name: currentStage?.name,
    current_node_name: currentStage?.name, // Compatibilidade
    current_task_name: currentTask?.name
  }
}

export async function getProcessEvents(processId) {
  return eventRepository.findByProcessId(processId)
}

