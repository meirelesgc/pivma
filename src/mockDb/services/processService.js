import * as processRepository from '../repositories/processRepository'
import * as stageRepository from '../repositories/stageRepository'
import * as taskRepository from '../repositories/taskRepository'
import * as participantRepository from '../repositories/participantRepository'
import * as eventRepository from '../repositories/eventRepository'
import * as taskInstanceRepository from '../repositories/taskInstanceRepository'
import { nextId } from '../repositories/baseRepository'
import { db } from '../database'

export async function getUserProcesses(userId) {
  const user = db.users.find(u => u.id === userId)
  const isAdmin = user?.system_role === 'admin'

  let processes
  if (isAdmin) {
    processes = processRepository.findAll()
  } else {
    processes = processRepository.findByUserId(userId)
  }

  const participants = db.processParticipants

  return processes.map(p => {
    const type = processRepository.findTypeById(p.process_type_id)
    const currentStage = stageRepository.findStageById(p.current_stage_id)
    const participant = participants.find(part => part.process_instance_id === p.id && part.user_id === userId)
    const roleDef = db.processRoles.find(r => r.id === participant?.process_role_id)

    let roleName = roleDef?.name
    if (!roleName && isAdmin) {
      roleName = 'Coordenador do Grupo Gestor'
    }

    return {
      ...p,
      type_name: type?.name || 'Tipo desconhecido',
      current_node_name: currentStage?.name || 'Etapa desconhecida',
      user_role: roleName || 'Sem cargo'
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

  let processId
  do {
    const prefix = ['BRA', 'VAM', 'ALT', 'PRC', 'MET'][Math.floor(Math.random() * 5)]
    const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    processId = `${prefix}-2026-${num}`
  } while (db.processInstances.some(p => p.id === processId))

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
  // Apenas o Proponente (role 1): O criador do processo
  participantRepository.create({
    id: nextId(db.processParticipants),
    process_instance_id: processId,
    user_id: userId,
    process_role_id: 1,
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

  // 5. Criar TaskInstances para todas as tarefas da etapa inicial (primeira como pending, outras como locked)
  const stageTasks = taskRepository.findTasksByStage(firstStage.id)
  stageTasks.forEach((t, index) => {
    taskInstanceRepository.create({
      stage_instance_id: stageInstanceId,
      process_instance_id: processId,
      task_id: t.id,
      status: index === 0 ? 'pending' : 'locked',
      started_at: index === 0 ? new Date().toISOString() : null,
      completed_at: null
    })
  })

  return process
}

export async function getProcessDetails(id) {
  const process = processRepository.findById(id)
  if (!process) return null

  const type = processRepository.findTypeById(process.process_type_id)
  const currentStage = stageRepository.findStageById(process.current_stage_id)
  const currentTask = taskRepository.findTaskById(process.current_task_id)
  
  // Joins task instances with their process tasks definitions (separating definition from execution)
  const taskInstances = db.taskInstances.filter(ti => ti.process_instance_id === id)
  const tasks = taskInstances.map(ti => {
    const def = db.processTasks.find(pt => pt.id === ti.task_id)
    return {
      ...ti,
      name: def?.name || 'Tarefa sem nome',
      stage_id: def?.stage_id || null,
      task_type: def?.task_type || 'custom',
      sort_order: def?.sort_order || 0,
      viewer_roles: def?.viewer_roles || [],
      editor_roles: def?.editor_roles || [],
      approver_roles: def?.approver_roles || [],
      target_role_id: def?.target_role_id || null
    }
  }).sort((a, b) => a.sort_order - b.sort_order)

  // Joins process participants with users and roles
  const participants = db.processParticipants
    .filter(pp => pp.process_instance_id === id)
    .map(pp => {
      const u = db.users.find(usr => usr.id === pp.user_id)
      const r = db.processRoles.find(rl => rl.id === pp.process_role_id)
      return {
        ...pp,
        user_name: u?.name || 'Usuário desconhecido',
        role_name: r?.name || 'Cargo desconhecido'
      }
    })

  // Get all stages of the process type and calculate status
  const allStages = stageRepository.findStagesByProcessType(process.process_type_id)
  const stages = allStages.map(s => {
    const si = db.stageInstances.find(instance => instance.process_instance_id === id && instance.stage_id === s.id)
    let status = 'pending'
    if (process.status === 'completed') {
      status = 'completed'
    } else if (si) {
      status = si.status
    }
    return {
      id: s.id,
      name: s.name,
      sort_order: s.sort_order,
      status
    }
  })

  return {
    ...process,
    type_name: type?.name,
    current_stage_name: currentStage?.name,
    current_node_name: currentStage?.name, // Compatibilidade
    current_task_name: currentTask?.name,
    tasks,
    participants,
    stages
  }
}

export async function getProcessEvents(processId) {
  return eventRepository.findByProcessId(processId)
}

export async function addProcessParticipant({ processInstanceId, userId, processRoleId }) {
  // Verifica se o participante já está associado a esse papel no processo
  const existing = db.processParticipants.find(
    p => p.process_instance_id === processInstanceId && 
         p.user_id === userId && 
         p.process_role_id === processRoleId
  )
  if (existing) return existing

  const newParticipant = participantRepository.create({
    id: nextId(db.processParticipants),
    process_instance_id: processInstanceId,
    user_id: userId,
    process_role_id: processRoleId,
    joined_at: new Date().toISOString()
  })

  // Log event
  const user = db.users.find(u => u.id === userId)
  const role = db.processRoles.find(r => r.id === processRoleId)
  await eventRepository.create({
    process_instance_id: processInstanceId,
    user_id: userId,
    event_type: 'participant_added',
    description: `Usuário "${user?.name}" adicionado ao processo com o papel "${role?.name}".`,
    created_at: new Date().toISOString()
  })

  return newParticipant
}

export async function removeProcessParticipant({ processInstanceId, userId, processRoleId }) {
  const removed = participantRepository.removeByUserAndProcessAndRole(userId, processInstanceId, processRoleId)
  if (removed) {
    // Log event
    const user = db.users.find(u => u.id === userId)
    const role = db.processRoles.find(r => r.id === processRoleId)
    await eventRepository.create({
      process_instance_id: processInstanceId,
      user_id: userId,
      event_type: 'participant_removed',
      description: `Usuário "${user?.name}" removido do papel "${role?.name}".`,
      created_at: new Date().toISOString()
    })
  }
  return removed
}

