import * as taskRepository from '../repositories/taskRepository'
import * as stageRepository from '../repositories/stageRepository'
import * as processRepository from '../repositories/processRepository'
import * as eventRepository from '../repositories/eventRepository'
import * as documentRepository from '../repositories/documentRepository'
import * as commentRepository from '../repositories/commentRepository'
import * as feedbackRepository from '../repositories/feedbackRepository'
import * as workflowService from './workflowService'
import { nextId } from '../repositories/baseRepository'
import { db } from '../database'

export async function getTaskDetails(taskId) {
  return taskRepository.findTaskById(taskId)
}

export async function getTaskInstance(taskInstanceId) {
  return db.taskInstances.find(ti => ti.id === taskInstanceId)
}

export async function getTaskInstanceByProcessAndTask(processId, taskId) {
  const stageInstances = db.stageInstances.filter(si => si.process_instance_id === processId)
  const stageInstanceIds = stageInstances.map(si => si.id)
  return db.taskInstances.find(ti => stageInstanceIds.includes(ti.stage_instance_id) && ti.task_id === taskId)
}

export async function completeTask(taskInstanceId, userId) {
  return workflowService.completeTask(taskInstanceId, userId)
}

export async function approveTask(taskInstanceId, userId) {
  return workflowService.approveTask(taskInstanceId, userId)
}

export async function rejectTask(taskInstanceId, userId, commentText) {
  return workflowService.rejectTask(taskInstanceId, userId, commentText)
}

export async function requestAdjustments(processId, userId) {
  return workflowService.requestAdjustments(processId, userId)
}

export async function logEvent(processId, userId, type, description) {
  return eventRepository.create({
    process_instance_id: processId,
    user_id: userId,
    event_type: type,
    description
  })
}

export async function uploadDocument(data) {
  return documentRepository.create(data)
}

export async function getDocumentsByTaskInstance(taskInstanceId) {
  return documentRepository.findByTaskInstanceId(taskInstanceId)
}

export async function addComment(data) {
  return commentRepository.create(data)
}

export async function getCommentsByTaskInstance(taskInstanceId) {
  return commentRepository.findByTaskInstanceId(taskInstanceId)
}

export async function updateTaskInstance(taskInstanceId, data) {
  return taskRepository.updateTaskInstance(taskInstanceId, data)
}

export async function getFieldFeedbacks(processId) {
  return feedbackRepository.findByProcessId(processId)
}

export async function createFieldFeedback(feedback) {
  return feedbackRepository.create(feedback)
}

export async function deleteFieldFeedback(id) {
  return feedbackRepository.deleteById(id)
}

export async function deleteFeedbacksByTaskInstance(taskInstanceId) {
  return feedbackRepository.deleteByTaskInstanceId(taskInstanceId)
}
