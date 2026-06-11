import { db } from '../database'

export function findWorkflowById(id) {
  return db.workflows.find(w => w.id === id)
}

export function findNodesByWorkflow(workflowId) {
  return db.workflowNodes.filter(n => n.workflow_id === workflowId)
}

export function findNodeById(id) {
  return db.workflowNodes.find(n => n.id === id)
}

export function findTransitionsByFromNode(nodeId) {
  return db.workflowTransitions.filter(t => t.from_node_id === nodeId)
}
