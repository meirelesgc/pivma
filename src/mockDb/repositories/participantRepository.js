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

export function remove(id) {
  const index = db.processParticipants.findIndex(p => p.id === id)
  if (index !== -1) {
    db.processParticipants.splice(index, 1)
    return true
  }
  return false
}

export function removeByUserAndProcessAndRole(userId, processId, roleId) {
  const index = db.processParticipants.findIndex(
    p => p.user_id === userId && p.process_instance_id === processId && p.process_role_id === roleId
  )
  if (index !== -1) {
    db.processParticipants.splice(index, 1)
    return true
  }
  return false
}

