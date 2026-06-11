import processes from '../data/mock/process_instances.json'
import participants from '../data/mock/process_participants.json'
import processTypes from '../data/mock/process_types.json'
import workflowNodes from '../data/mock/workflow_nodes.json'

export async function getProcessesByUser(userId) {
  // Simula latência da rede
  await new Promise(resolve => setTimeout(resolve, 500))

  const userParticipantShips = participants.filter(p => p.user_id === userId)
  const processIds = userParticipantShips.map(p => p.process_instance_id)

  const userProcesses = processes
    .filter(p => processIds.includes(p.id))
    .map(p => {
      const type = processTypes.find(t => t.id === p.process_type_id)
      const currentNode = workflowNodes.find(n => n.id === p.current_node_id)
      const participant = userParticipantShips.find(part => part.process_instance_id === p.id)

      return {
        ...p,
        type_name: type?.name || 'Tipo desconhecido',
        current_node_name: currentNode?.name || 'Etapa desconhecida',
        user_role: participant?.process_role
      }
    })

  return userProcesses
}
