import * as processService from '../mockDb/services/processService'

export async function getProcessesByUser(userId) {
  // Simula latência da rede
  await new Promise(resolve => setTimeout(resolve, 500))

  return processService.getUserProcesses(userId)
}

export async function createProcess(data) {
  await new Promise(resolve => setTimeout(resolve, 500))

  return processService.createProcess(data)
}

export async function getProcessById(id) {
  await new Promise(resolve => setTimeout(resolve, 500))

  return processService.getProcessDetails(id)
}
