import * as userRepository from '../repositories/userRepository'

export async function getAllUsers() {
  return userRepository.findAll()
}

export async function getUserById(id) {
  return userRepository.findById(id)
}

export async function getUserByEmail(email) {
  return userRepository.findByEmail(email)
}
