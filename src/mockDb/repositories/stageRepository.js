import { db } from '../database'

export function findStagesByProcessType(processTypeId) {
  return db.processStages
    .filter(s => s.process_type_id === processTypeId)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function findStageById(id) {
  return db.processStages.find(s => s.id === id)
}

export function createStageInstance(instance) {
  db.stageInstances.push(instance)
  return instance
}

export function findStageInstancesByProcess(processInstanceId) {
  return db.stageInstances.filter(si => si.process_instance_id === processInstanceId)
}

export function updateStageInstance(id, data) {
  const index = db.stageInstances.findIndex(si => si.id === id)
  if (index !== -1) {
    db.stageInstances[index] = { ...db.stageInstances[index], ...data }
    return db.stageInstances[index]
  }
  return null
}
