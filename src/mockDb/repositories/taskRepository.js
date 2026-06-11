import { db } from '../database'

export function findTasksByStage(stageId) {
  return db.processTasks
    .filter(t => t.stage_id === stageId)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function findTaskById(id) {
  return db.processTasks.find(t => t.id === id)
}

export function createTaskInstance(instance) {
  db.taskInstances.push(instance)
  return instance
}

export function findTaskInstancesByStageInstance(stageInstanceId) {
  return db.taskInstances.filter(ti => ti.stage_instance_id === stageInstanceId)
}

export function updateTaskInstance(id, data) {
  const index = db.taskInstances.findIndex(ti => ti.id === id)
  if (index !== -1) {
    db.taskInstances[index] = { ...db.taskInstances[index], ...data }
    return db.taskInstances[index]
  }
  return null
}
