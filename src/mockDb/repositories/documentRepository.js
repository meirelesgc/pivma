import { db } from '../database'
import { nextId } from './baseRepository'

export function findAll() {
  return db.uploadedDocuments
}

export function findByTaskInstanceId(taskInstanceId) {
  return db.uploadedDocuments.filter(doc => doc.task_instance_id === taskInstanceId)
}

export function create(document) {
  const newDocument = {
    ...document,
    id: nextId(db.uploadedDocuments),
    uploaded_at: new Date().toISOString()
  }
  db.uploadedDocuments.push(newDocument)
  return newDocument
}
