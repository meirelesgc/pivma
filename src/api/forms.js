import * as formService from '../mockDb/services/formService'

export async function getFormDetails(formId) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return formService.getFormDetails(formId)
}

export async function submitFormResponse(data) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return formService.submitFormResponse(data)
}

export async function getResponsesByProcess(processId) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return formService.getResponsesByProcess(processId)
}

