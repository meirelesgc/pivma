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

