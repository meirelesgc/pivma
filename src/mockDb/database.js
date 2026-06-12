import users from '../data/mock/users.json'
import processTypes from '../data/mock/process_types.json'
import processStages from '../data/mock/process_stages.json'
import processTasks from '../data/mock/process_tasks.json'
import fieldAiRules from '../data/mock/field_ai_rules.json'
import processRoles from '../data/mock/process_roles.json'

import processInstances from '../data/mock/process_instances.json'
import processParticipants from '../data/mock/process_participants.json'
import stageInstances from '../data/mock/stage_instances.json'
import taskInstances from '../data/mock/task_instances.json'
import processEvents from '../data/mock/process_events.json'
import uploadedDocuments from '../data/mock/uploaded_documents.json'
import taskComments from '../data/mock/task_comments.json'

import forms from '../data/mock/forms.json'
import formFields from '../data/mock/form_fields.json'
import formResponses from '../data/mock/form_responses.json'

export const db = {
  users: structuredClone(users),
  
  // Configuration
  processTypes: structuredClone(processTypes),
  processStages: structuredClone(processStages),
  processTasks: structuredClone(processTasks),
  processRoles: structuredClone(processRoles),
  fieldAiRules: structuredClone(fieldAiRules),
  
  // Execution
  processInstances: structuredClone(processInstances),
  processParticipants: structuredClone(processParticipants),
  stageInstances: structuredClone(stageInstances),
  taskInstances: structuredClone(taskInstances),
  processEvents: structuredClone(processEvents),
  uploadedDocuments: structuredClone(uploadedDocuments),
  taskComments: structuredClone(taskComments),
  fieldFeedbacks: [],

  
  // Forms
  forms: structuredClone(forms),
  formFields: structuredClone(formFields),
  formResponses: structuredClone(formResponses)
}
