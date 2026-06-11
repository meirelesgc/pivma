import { db } from '../database'

export function findByProcessId(processId) {
  return db.processParticipants.filter(p => p.process_instance_id === processId)
}

export function findByUserId(userId) {
  return db.processParticipants.filter(p => p.user_id === userId)
}

export function findByUserAndProcess(userId, processId) {
  return db.processParticipants.find(
    p => p.user_id === userId && p.process_instance_id === processId
  )
}

export function create(participant) {
  db.processParticipants.push(participant)
  return participant
}
