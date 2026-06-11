import users from '../data/mock/users.json'

export async function login(userId) {
  await new Promise(resolve => setTimeout(resolve, 500))
  const user = users.find(u => u.id === userId)
  if (user) {
    localStorage.setItem('token', String(userId))
    return { token: String(userId), user }
  }
  throw new Error('Error')
}

export async function getMe() {
  await new Promise(resolve => setTimeout(resolve, 500))
  const token = localStorage.getItem('token')
  if (token) {
    const user = users.find(u => String(u.id) === token)
    if (user) return user
  }
  throw new Error('Error')
}

export async function logout() {
  await new Promise(resolve => setTimeout(resolve, 200))
  localStorage.removeItem('token')
  return true
}
