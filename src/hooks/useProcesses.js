import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getAvailableProcesses, 
  getProcessInstances, 
  createProcessInstance, 
  getProcessInstanceRoles,
  getProcessSteps,
  getProcessInstanceSteps,
  updateProcessInstanceStep,
  getTasks,
  getProcessInstanceTasks,
  updateProcessInstanceTask
} from '../services/processes'

export function useProcesses() {
  const queryClient = useQueryClient()

  const availableProcessesQuery = useQuery({
    queryKey: ['availableProcesses'],
    queryFn: getAvailableProcesses
  })

  const processInstancesQuery = useQuery({
    queryKey: ['processInstances'],
    queryFn: getProcessInstances
  })

  const processInstanceRolesQuery = useQuery({
    queryKey: ['processInstanceRoles'],
    queryFn: getProcessInstanceRoles
  })

  const processStepsQuery = useQuery({
    queryKey: ['processSteps'],
    queryFn: getProcessSteps
  })

  const processInstanceStepsQuery = useQuery({
    queryKey: ['processInstanceSteps'],
    queryFn: getProcessInstanceSteps
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks
  })

  const processInstanceTasksQuery = useQuery({
    queryKey: ['processInstanceTasks'],
    queryFn: getProcessInstanceTasks
  })

  const createInstanceMutation = useMutation({
    mutationFn: createProcessInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstances'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceRoles'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
    }
  })

  const updateStepMutation = useMutation({
    mutationFn: updateProcessInstanceStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: updateProcessInstanceTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
    }
  })

  return {
    availableProcesses: availableProcessesQuery.data || [],
    isLoadingAvailable: availableProcessesQuery.isLoading,
    processInstances: processInstancesQuery.data || [],
    isLoadingInstances: processInstancesQuery.isLoading,
    processInstanceRoles: processInstanceRolesQuery.data || [],
    isLoadingRoles: processInstanceRolesQuery.isLoading,
    processSteps: processStepsQuery.data || [],
    isLoadingSteps: processStepsQuery.isLoading,
    processInstanceSteps: processInstanceStepsQuery.data || [],
    isLoadingInstanceSteps: processInstanceStepsQuery.isLoading,
    tasks: tasksQuery.data || [],
    isLoadingTasks: tasksQuery.isLoading,
    processInstanceTasks: processInstanceTasksQuery.data || [],
    isLoadingInstanceTasks: processInstanceTasksQuery.isLoading,
    createProcessInstance: createInstanceMutation.mutate,
    updateProcessInstanceStep: updateStepMutation.mutate,
    updateProcessInstanceTask: updateTaskMutation.mutate
  }
}

