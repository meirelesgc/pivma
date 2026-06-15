import { db } from './db'

export async function login(userId) {
  const user = db.getUserById(userId)
  if (user) {
    localStorage.setItem('token', String(userId))
    return { token: String(userId), user }
  }
  throw new Error('Error')
}

export async function getMe() {
  const token = localStorage.getItem('token')
  if (token) {
    const user = db.getUserById(token)
    if (user) return user
  }
  throw new Error('Error')
}

export async function logout() {
  localStorage.removeItem('token')
  return true
}
