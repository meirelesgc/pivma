import { db } from '../database'
import { nextId } from './baseRepository'

export function create(feedback) {
  const newFeedback = {
    ...feedback,
    id: nextId(db.fieldFeedbacks),
    created_at: new Date().toISOString()
  }
  db.fieldFeedbacks.push(newFeedback)
  return newFeedback
}

export function findByProcessId(processId) {
  return db.fieldFeedbacks.filter(f => f.process_instance_id === processId)
}

export function deleteByTaskInstanceId(taskInstanceId) {
  db.fieldFeedbacks = db.fieldFeedbacks.filter(f => f.task_instance_id !== taskInstanceId)
}

export function deleteById(id) {
  db.fieldFeedbacks = db.fieldFeedbacks.filter(f => f.id !== id)
}
