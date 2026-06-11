import users from '../data/mock/users.json'

export async function getUsers() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return users
}
