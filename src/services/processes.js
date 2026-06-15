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

