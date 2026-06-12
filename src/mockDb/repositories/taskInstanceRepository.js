import { db } from '../database'
import { nextId } from './baseRepository'
import * as taskRepository from './taskRepository'

export function findByProcess(processId) {
  return db.taskInstances.filter(ti => ti.process_instance_id === processId)
}

export function findPendingByProcess(processId) {
  // Retorna a tarefa atual que está aguardando ação ('pending' ou 'in_progress')
  return db.taskInstances.find(ti => 
    ti.process_instance_id === processId && 
    (ti.status === 'pending' || ti.status === 'in_progress')
  )
}

export function create(instance) {
  const newInstance = {
    ...instance,
    id: nextId(db.taskInstances)
  }
  db.taskInstances.push(newInstance)
  return newInstance
}

export function update(id, data) {
  const index = db.taskInstances.findIndex(ti => ti.id === id)
  if (index !== -1) {
    db.taskInstances[index] = { ...db.taskInstances[index], ...data }
    return db.taskInstances[index]
  }
  return null
}
