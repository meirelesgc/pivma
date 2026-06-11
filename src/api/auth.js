import * as userService from '../mockDb/services/userService'

export async function login(userId) {
  // Simula latência
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const user = await userService.getUserById(userId)
  if (user) {
    localStorage.setItem('token', String(userId))
    return { token: String(userId), user }
  }
  throw new Error('Usuário não encontrado')
}

export async function getMe() {
  await new Promise(resolve => setTimeout(resolve, 500))
  const token = localStorage.getItem('token')
  if (token) {
    const user = await userService.getUserById(Number(token))
    if (user) return user
  }
  throw new Error('Não autenticado')
}

export async function logout() {
  await new Promise(resolve => setTimeout(resolve, 200))
  localStorage.removeItem('token')
  return true
}
