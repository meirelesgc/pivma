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
  await new Promise(resolve => setTimeout(resolve, 300))
  return db.getProcessInstanceRoles()
}

export async function getProcessSteps() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return db.getProcessSteps()
}

export async function getProcessInstanceSteps() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return db.getProcessInstanceSteps()
}

export async function updateProcessInstanceStep({ stepInstanceId, isCompleted }) {
  await new Promise(resolve => setTimeout(resolve, 100))
  return db.toggleProcessInstanceStep(stepInstanceId, isCompleted)
}

export async function getTasks() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return db.getTasks()
}

export async function getProcessInstanceTasks() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return db.getProcessInstanceTasks()
}

export async function updateProcessInstanceTask({ taskInstanceId, isCompleted }) {
  await new Promise(resolve => setTimeout(resolve, 100))
  return db.toggleProcessInstanceTask(taskInstanceId, isCompleted)
}

