import { db } from '../database'

export function findAll() {
  return db.processInstances
}

export function findById(id) {
  return db.processInstances.find(process => process.id === id)
}

export function findByUserId(userId) {
  // Encontra IDs de processos onde o usuário é participante
  const processIds = db.processParticipants
    .filter(p => p.user_id === userId)
    .map(p => p.process_instance_id)

  return db.processInstances.filter(p => processIds.includes(p.id))
}

export function create(process) {
  db.processInstances.push(process)
  return process
}

export function update(id, data) {
  const index = db.processInstances.findIndex(p => p.id === id)
  if (index !== -1) {
    db.processInstances[index] = { ...db.processInstances[index], ...data }
    return db.processInstances[index]
  }
  return null
}

export function findTypes() {
  return db.processTypes
}

export function findTypeById(id) {
  return db.processTypes.find(t => t.id === id)
}

export function findParticipantsByProcess(processId) {
  return db.processParticipants.filter(p => p.process_instance_id === processId)
}

export function addParticipant(participant) {
  db.processParticipants.push(participant)
  return participant
}
