import * as processRepository from '../repositories/processRepository'
import * as workflowRepository from '../repositories/workflowRepository'
import * as participantRepository from '../repositories/participantRepository'
import { nextId } from '../repositories/baseRepository'
import { db } from '../database'

export async function getUserProcesses(userId) {
  const processes = processRepository.findByUserId(userId)
  const participants = participantRepository.findByUserId(userId)

  return processes.map(p => {
    const type = processRepository.findTypeById(p.process_type_id)
    const currentNode = workflowRepository.findNodeById(p.current_node_id)
    const participant = participants.find(part => part.process_instance_id === p.id)

    return {
      ...p,
      type_name: type?.name || 'Tipo desconhecido',
      current_node_name: currentNode?.name || 'Etapa desconhecida',
      user_role: participant?.process_role
    }
  })
}

export async function createProcess({
  processTypeId,
  userId,
  title
}) {
  const type = processRepository.findTypeById(processTypeId)
  if (!type) throw new Error('Tipo de processo não encontrado')

  const processId = nextId(db.processInstances)
  
  const process = {
    id: processId,
    title,
    process_type_id: processTypeId,
    workflow_id: type.workflow_id,
    created_by: userId,
    status: 'active',
    current_node_id: type.start_node_id || 1, // Fallback se não definido
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  processRepository.create(process)

  // Adiciona o criador como participante (Owner)
  participantRepository.create({
    id: nextId(db.processParticipants),
    process_instance_id: processId,
    user_id: userId,
    process_role: 'Proprietário',
    joined_at: new Date().toISOString()
  })

  return process
}

export async function getProcessDetails(id) {
  const process = processRepository.findById(id)
  if (!process) return null

  const type = processRepository.findTypeById(process.process_type_id)
  const currentNode = workflowRepository.findNodeById(process.current_node_id)
  
  return {
    ...process,
    type_name: type?.name,
    current_node_name: currentNode?.name
  }
}
