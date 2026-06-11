import { db } from '../database'

export function findAll() {
  return db.forms
}

export function findById(id) {
  return db.forms.find(f => f.id === id)
}

export function findFieldsByForm(formId) {
  return db.formFields.filter(field => field.form_id === formId)
}

export function saveResponse(response) {
  db.formResponses.push(response)
  return response
}

export function findResponsesByProcess(processId) {
  return db.formResponses.filter(r => r.process_instance_id === processId)
}

export function findAiRulesByField(fieldId) {
  return db.fieldAiRules.filter(rule => rule.field_id === fieldId)
}
