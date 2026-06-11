import users from '../data/mock/users.json'
import processTypes from '../data/mock/process_types.json'
import processInstances from '../data/mock/process_instances.json'
import processParticipants from '../data/mock/process_participants.json'
import workflows from '../data/mock/workflows.json'
import workflowNodes from '../data/mock/workflow_nodes.json'
import workflowTransitions from '../data/mock/workflow_transitions.json'
import forms from '../data/mock/forms.json'
import formFields from '../data/mock/form_fields.json'
import formResponses from '../data/mock/form_responses.json'
import nodeInstances from '../data/mock/node_instances.json'

export const db = {
  users: structuredClone(users),
  processTypes: structuredClone(processTypes),
  processInstances: structuredClone(processInstances),
  processParticipants: structuredClone(processParticipants),
  workflows: structuredClone(workflows),
  workflowNodes: structuredClone(workflowNodes),
  workflowTransitions: structuredClone(workflowTransitions),
  forms: structuredClone(forms),
  formFields: structuredClone(formFields),
  formResponses: structuredClone(formResponses),
  nodeInstances: structuredClone(nodeInstances)
}
