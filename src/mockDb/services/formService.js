import * as formRepository from '../repositories/formRepository'

export async function getFormDetails(formId) {
  const form = formRepository.findById(formId)
  if (!form) return null

  const fields = formRepository.findFieldsByForm(formId)
  
  const fieldsWithRules = fields.map(field => ({
    ...field,
    ai_rules: formRepository.findAiRulesByField(field.id)
  }))

  return {
    ...form,
    fields: fieldsWithRules
  }
}

export async function submitFormResponse(data) {
  return formRepository.saveResponse({
    ...data,
    submitted_at: new Date().toISOString()
  })
}

export async function getResponsesByProcess(processId) {
  return formRepository.findResponsesByProcess(processId)
}

