import { db } from '../database'
import { nextId } from './baseRepository'

export function findAll() {
  return db.taskComments
}

export function findByTaskInstanceId(taskInstanceId) {
  return db.taskComments.filter(comment => comment.task_instance_id === taskInstanceId)
}

export function create(comment) {
  const newComment = {
    ...comment,
    id: nextId(db.taskComments),
    created_at: new Date().toISOString()
  }
  db.taskComments.push(newComment)
  return newComment
}
