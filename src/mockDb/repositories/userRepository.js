import { db } from '../database'

export function findAll() {
  return db.users
}

export function findById(id) {
  return db.users.find(user => user.id === id)
}

export function findByEmail(email) {
  return db.users.find(user => user.email === email)
}
