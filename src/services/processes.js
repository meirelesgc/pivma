import { db } from './db'

export async function getAvailableProcesses() {
  return db.getAvailableProcesses()
}

export async function getProcessInstances() {
  return db.getProcessInstances()
}

export async function createProcessInstance(instance) {
  return db.addProcessInstance(instance)
}

export async function getProcessInstanceRoles() {
  return db.getProcessInstanceRoles()
}

export async function getProcessSteps() {
  return db.getProcessSteps()
}

export async function getProcessInstanceSteps() {
  return db.getProcessInstanceSteps()
}

export async function updateProcessInstanceStep({ stepInstanceId, isCompleted }) {
  return db.toggleProcessInstanceStep(stepInstanceId, isCompleted)
}

export async function getTasks() {
  return db.getTasks()
}

export async function getProcessInstanceTasks() {
  return db.getProcessInstanceTasks()
}

export async function updateProcessInstanceTask({ taskInstanceId, isCompleted }) {
  return db.toggleProcessInstanceTask(taskInstanceId, isCompleted)
}

export async function getFormFieldsByTaskId(taskId) {
  return db.getFormFieldsByTaskId(taskId)
}

export async function getFormAnswers(instanceTaskId) {
  return db.getFormAnswers(instanceTaskId)
}

export async function saveFormAnswers({ instanceTaskId, answers }) {
  return db.saveFormAnswers(instanceTaskId, answers)
}

export async function getFieldReviews() {
  return db.getFieldReviews()
}

export async function createFieldReview(review) {
  return db.addFieldReview(review)
}

export async function submitFormTask({ instanceTaskId, answers }) {
  return db.submitFormTask(instanceTaskId, answers)
}

export async function runAIEvaluation(instanceTaskId) {
  return db.runAIEvaluation(instanceTaskId)
}

export async function acceptReview(instanceTaskId) {
  return db.acceptReview(instanceTaskId)
}

export async function rejectReview(instanceTaskId) {
  return db.rejectReview(instanceTaskId)
}

export async function registerUser(userData) {
  return db.registerUser(userData)
}

export async function completeAssignmentTask({ taskInstanceId, assignments }) {
  return db.completeAssignmentTask(taskInstanceId, assignments)
}

export async function getPendingInvites() {
  return db.getPendingInvites()
}

export async function getSampleDefinitions(instanceId) {
  return db.getSampleDefinitions(instanceId)
}

export async function getSampleBlindCodes(instanceId) {
  return db.getSampleBlindCodes(instanceId)
}

export async function saveSampleDefinitions({ instanceId, samples }) {
  return db.saveSampleDefinitions(instanceId, samples)
}

