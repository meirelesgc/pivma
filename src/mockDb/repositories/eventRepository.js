import { db } from '../database'
import { nextId } from './baseRepository'

export function findAll() {
  return db.processEvents
}

export function findByProcessId(processId) {
  return db.processEvents.filter(event => event.process_instance_id === processId)
}

export function create(event) {
  const newEvent = {
    ...event,
    id: nextId(db.processEvents),
    created_at: new Date().toISOString()
  }
  db.processEvents.push(newEvent)
  return newEvent
}
