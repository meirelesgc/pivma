import * as taskService from '../mockDb/services/taskService'

export async function getTaskDetails(taskId) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return taskService.getTaskDetails(taskId)
}

export async function getTaskInstance(taskInstanceId) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return taskService.getTaskInstance(taskInstanceId)
}

export async function getTaskInstanceByProcessAndTask(processId, taskId) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return taskService.getTaskInstanceByProcessAndTask(processId, taskId)
}

export async function completeTask(taskInstanceId, userId) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return taskService.completeTask(taskInstanceId, userId)
}

export async function logProcessEvent(data) {
  const { processId, userId, type, description } = data
  return taskService.logEvent(processId, userId, type, description)
}

export async function uploadDocument(data) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return taskService.uploadDocument(data)
}

export async function getDocuments(taskInstanceId) {
  return taskService.getDocumentsByTaskInstance(taskInstanceId)
}

export async function addComment(data) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return taskService.addComment(data)
}

export async function getComments(taskInstanceId) {
  return taskService.getCommentsByTaskInstance(taskInstanceId)
}

export async function updateTaskInstance(taskInstanceId, data) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return taskService.updateTaskInstance(taskInstanceId, data)
}

