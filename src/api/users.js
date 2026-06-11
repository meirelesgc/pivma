import * as userService from '../mockDb/services/userService'

export async function getUsers() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return userService.getAllUsers()
}
