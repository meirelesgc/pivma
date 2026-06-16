import { useMemo } from 'react'
import { useProcesses } from './useProcesses'
import { useAuth } from './useAuth'

export function useMyTasks() {
  const { user: currentUser } = useAuth()
  const {
    processInstances = [],
    processInstanceRoles = [],
    processInstanceTasks = [],
    tasks = [],
    processSteps = [],
    processInstanceSteps = []
  } = useProcesses()

  const myTasks = useMemo(() => {
    if (!currentUser) return []

    // 1. Get all roles the user has in all instances
    // Map of instanceId -> Array of roles (lowercased)
    const userInstanceRoles = {}
    processInstanceRoles.forEach(r => {
      if (r.user_id === currentUser.id) {
        if (!userInstanceRoles[r.instance_id]) {
          userInstanceRoles[r.instance_id] = []
        }
        userInstanceRoles[r.instance_id].push(r.role.toLowerCase())
      }
    })

    // Map of instanceId -> activeStepId
    const activeStepByInstance = {}
    processInstances.forEach(instance => {
      const steps = processSteps
        .filter(s => s.process_id === instance.process_id)
        .sort((a, b) => a.sequence - b.sequence)
      const instSteps = processInstanceSteps.filter(s => s.process_instance_id === instance.id)
      
      const activeStep = steps.find((step, index) => {
        const instStep = instSteps.find(s => s.step_id === step.id)
        const isCompleted = instStep?.is_completed ?? false
        const isFirst = index === 0
        const prevCompleted = isFirst || (instSteps.find(s => s.step_id === steps[index - 1].id)?.is_completed ?? false)
        return !isCompleted && prevCompleted
      })
      
      activeStepByInstance[instance.id] = activeStep?.id || (steps.length > 0 ? steps[0].id : null)
    })

    // 2. Filter and enrich tasks
    const enriched = []

    processInstanceTasks.forEach(pit => {
      const instance = processInstances.find(pi => pi.id === pit.process_instance_id)
      if (!instance) return

      const taskDef = tasks.find(t => t.id === pit.task_id)
      if (!taskDef) return

      const stepInstance = processInstanceSteps.find(s => s.id === pit.process_instance_step_id)
      if (!stepInstance) return

      const stepDef = processSteps.find(s => s.id === stepInstance.step_id)
      if (!stepDef) return

      // Determine roles for this instance
      const myRolesInInstance = userInstanceRoles[pit.process_instance_id] || []
      if (myRolesInInstance.length === 0) return // User has no role in this instance

      const executorRole = taskDef.role?.toLowerCase()
      const hasExecutorRole = executorRole && myRolesInInstance.includes(executorRole)

      const reviewerRole = pit.current_reviewer_role?.toLowerCase()
      const hasCurrentReviewerRole = reviewerRole && myRolesInInstance.includes(reviewerRole)

      // Visibilidade: O usuário só pode visualizar tarefas relacionadas aos seus papéis dentro das instâncias
      if (!hasExecutorRole && !hasCurrentReviewerRole) return

      // Check if task belongs to user based on roles (active responsibility)
      const inReview = pit.status === 'pending_review' || pit.status === 'analyzing_ai'
      let isMyTask = false

      if (inReview) {
        if (hasCurrentReviewerRole) {
          isMyTask = true
        }
      } else {
        if (hasExecutorRole) {
          isMyTask = true
        }
      }

      // 3. Determine if the task is Blocked
      // A task is blocked if the step sequence > 1 AND the previous step of the instance is not completed
      let isBlocked = false
      if (stepDef.sequence > 1) {
        const prevStepDef = processSteps.find(
          s => s.process_id === stepDef.process_id && s.sequence === stepDef.sequence - 1
        )
        if (prevStepDef) {
          const prevStepInst = processInstanceSteps.find(
            s => s.process_instance_id === pit.process_instance_id && s.step_id === prevStepDef.id
          )
          if (prevStepInst && !prevStepInst.is_completed) {
            isBlocked = true
          }
        }
      }

      // Determine Column Group
      let kanbanColumn
      if (pit.is_completed || pit.status === 'completed') {
        kanbanColumn = 'completed'
      } else if (isBlocked) {
        kanbanColumn = 'blocked'
      } else if (inReview) {
        kanbanColumn = 'review'
      } else {
        kanbanColumn = 'todo'
      }

      const isActiveStep = stepDef.id === activeStepByInstance[pit.process_instance_id]

      enriched.push({
        ...pit,
        ...taskDef,
        id: pit.id, // instance task ID
        task_id: taskDef.id,
        instanceId: pit.process_instance_id,
        formattedInstanceId: `BRA-2026-${String(pit.process_instance_id).padStart(3, '0')}`,
        stepName: stepDef.name,
        stepSequence: stepDef.sequence,
        stepId: stepDef.id,
        instanceCreatedAt: instance.createdAt || '',
        kanbanColumn,
        isMyTask,
        isActiveStep
      })
    })

    // 4. Sort tasks:
    // - Instância mais antiga primeiro (instanceId)
    // - Sequência da etapa (stepSequence)
    // - Ordem da tarefa dentro da etapa (task_id)
    return enriched.sort((a, b) => {
      if (a.instanceId !== b.instanceId) {
        return a.instanceId - b.instanceId
      }
      if (a.stepSequence !== b.stepSequence) {
        return a.stepSequence - b.stepSequence
      }
      return a.task_id - b.task_id
    })
  }, [currentUser, processInstances, processInstanceRoles, processInstanceTasks, tasks, processSteps, processInstanceSteps])

  return {
    tasks: myTasks,
    isLoading: processInstances.length === 0 && processInstanceTasks.length === 0
  }
}
