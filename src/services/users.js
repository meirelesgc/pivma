import { db } from './db'

export async function getUsers() {
  return db.getUsers()
}
