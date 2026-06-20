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
  updateProcessInstanceTask,
  getFormFieldsByTaskId,
  getFormAnswers,
  saveFormAnswers,
  getFieldReviews,
  createFieldReview,
  submitFormTask,
  runAIEvaluation,
  acceptReview,
  rejectReview,
  registerUser,
  completeAssignmentTask,
  getPendingInvites,
  getSampleDefinitions,
  getSampleBlindCodes,
  saveSampleDefinitions,
  getDataTemplates,
  getDataTemplateColumns,
  deleteDataTemplate,
  saveDataTemplate,
  getAuditLogsByInstanceId,
  getAdhocOpinions,
  saveAdhocOpinion,
  getGestorConsolidations,
  saveGestorConsolidation,
  getFinalDeliberations,
  saveFinalDeliberation
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

  const fieldReviewsQuery = useQuery({
    queryKey: ['fieldReviews'],
    queryFn: getFieldReviews
  })

  const createFieldReviewMutation = useMutation({
    mutationFn: createFieldReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldReviews'] })
    }
  })

  const submitFormTaskMutation = useMutation({
    mutationFn: submitFormTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['fieldReviews'] })
      queryClient.invalidateQueries({ queryKey: ['formAnswers', variables.instanceTaskId] })
    }
  })

  const runAIEvaluationMutation = useMutation({
    mutationFn: runAIEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['fieldReviews'] })
    }
  })

  const acceptReviewMutation = useMutation({
    mutationFn: acceptReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
    }
  })

  const rejectReviewMutation = useMutation({
    mutationFn: rejectReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['fieldReviews'] })
    }
  })

  const pendingInvitesQuery = useQuery({
    queryKey: ['pendingInvites'],
    queryFn: getPendingInvites
  })

  const registerUserMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceRoles'] })
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] })
    }
  })

  const completeAssignmentTaskMutation = useMutation({
    mutationFn: completeAssignmentTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceRoles'] })
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] })
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
    updateProcessInstanceTask: updateTaskMutation.mutate,
    fieldReviews: fieldReviewsQuery.data || [],
    isLoadingFieldReviews: fieldReviewsQuery.isLoading,
    createFieldReview: createFieldReviewMutation.mutate,
    submitFormTask: submitFormTaskMutation.mutate,
    runAIEvaluation: runAIEvaluationMutation.mutate,
    acceptReview: acceptReviewMutation.mutate,
    rejectReview: rejectReviewMutation.mutate,
    pendingInvites: pendingInvitesQuery.data || [],
    isLoadingPendingInvites: pendingInvitesQuery.isLoading,
    registerUser: registerUserMutation.mutate,
    registerUserAsync: registerUserMutation.mutateAsync,
    completeAssignmentTask: completeAssignmentTaskMutation.mutate,
    completeAssignmentTaskAsync: completeAssignmentTaskMutation.mutateAsync
  }
}

export function useFormTask(taskId, instanceTaskId) {
  const queryClient = useQueryClient()

  const formFieldsQuery = useQuery({
    queryKey: ['formFields', taskId],
    queryFn: () => getFormFieldsByTaskId(taskId),
    enabled: !!taskId
  })

  const formAnswersQuery = useQuery({
    queryKey: ['formAnswers', instanceTaskId],
    queryFn: () => getFormAnswers(instanceTaskId),
    enabled: !!instanceTaskId
  })

  const saveAnswersMutation = useMutation({
    mutationFn: saveFormAnswers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formAnswers', instanceTaskId] })
    }
  })

  return {
    fields: formFieldsQuery.data || [],
    isLoadingFields: formFieldsQuery.isLoading,
    answers: formAnswersQuery.data || {},
    isLoadingAnswers: formAnswersQuery.isLoading,
    saveAnswers: saveAnswersMutation.mutate,
    isSaving: saveAnswersMutation.isPending
  }
}

export function useSampleDefinitions(instanceId) {
  const queryClient = useQueryClient()

  const sampleDefinitionsQuery = useQuery({
    queryKey: ['sampleDefinitions', instanceId],
    queryFn: () => getSampleDefinitions(instanceId),
    enabled: !!instanceId
  })

  const sampleBlindCodesQuery = useQuery({
    queryKey: ['sampleBlindCodes', instanceId],
    queryFn: () => getSampleBlindCodes(instanceId),
    enabled: !!instanceId
  })

  const saveSamplesMutation = useMutation({
    mutationFn: saveSampleDefinitions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sampleDefinitions', instanceId] })
      queryClient.invalidateQueries({ queryKey: ['sampleBlindCodes', instanceId] })
    }
  })

  return {
    samples: sampleDefinitionsQuery.data || [],
    isLoadingSamples: sampleDefinitionsQuery.isLoading,
    blindCodes: sampleBlindCodesQuery.data || [],
    isLoadingBlindCodes: sampleBlindCodesQuery.isLoading,
    saveSamples: saveSamplesMutation.mutate,
    saveSamplesAsync: saveSamplesMutation.mutateAsync,
    isSavingSamples: saveSamplesMutation.isPending
  }
}

export function useDataTemplates(instanceId) {
  const queryClient = useQueryClient()

  const templatesQuery = useQuery({
    queryKey: ['dataTemplates', instanceId],
    queryFn: () => getDataTemplates(instanceId),
    enabled: !!instanceId
  })

  const saveTemplateMutation = useMutation({
    mutationFn: saveDataTemplate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dataTemplates', instanceId] })
      if (variables.template?.id) {
        queryClient.invalidateQueries({ queryKey: ['dataTemplateColumns', variables.template.id] })
      }
    }
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteDataTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataTemplates', instanceId] })
    }
  })

  return {
    templates: templatesQuery.data || [],
    isLoadingTemplates: templatesQuery.isLoading,
    saveTemplate: saveTemplateMutation.mutate,
    saveTemplateAsync: saveTemplateMutation.mutateAsync,
    isSavingTemplate: saveTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutate,
    deleteTemplateAsync: deleteTemplateMutation.mutateAsync,
    isDeletingTemplate: deleteTemplateMutation.isPending
  }
}

export function useDataTemplateColumns(templateId) {
  const columnsQuery = useQuery({
    queryKey: ['dataTemplateColumns', templateId],
    queryFn: () => getDataTemplateColumns(templateId),
    enabled: !!templateId
  })

  return {
    columns: columnsQuery.data || [],
    isLoadingColumns: columnsQuery.isLoading
  }
}

export function useAuditLogs(instanceId) {
  const auditLogsQuery = useQuery({
    queryKey: ['auditLogs', instanceId],
    queryFn: () => getAuditLogsByInstanceId(instanceId),
    enabled: !!instanceId
  })

  return {
    auditLogs: auditLogsQuery.data || [],
    isLoadingAuditLogs: auditLogsQuery.isLoading
  }
}

export function useAdhocOpinions(instanceId) {
  const queryClient = useQueryClient()

  const opinionsQuery = useQuery({
    queryKey: ['adhocOpinions', instanceId],
    queryFn: () => getAdhocOpinions(instanceId),
    enabled: !!instanceId
  })

  const saveOpinionMutation = useMutation({
    mutationFn: saveAdhocOpinion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhocOpinions', instanceId] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
      queryClient.invalidateQueries({ queryKey: ['allAuditLogs'] })
    }
  })

  return {
    opinions: opinionsQuery.data || [],
    isLoadingOpinions: opinionsQuery.isLoading,
    saveOpinion: saveOpinionMutation.mutate,
    isSavingOpinion: saveOpinionMutation.isPending
  }
}

export function useGestorConsolidations(instanceId) {
  const queryClient = useQueryClient()

  const consolidationsQuery = useQuery({
    queryKey: ['gestorConsolidations', instanceId],
    queryFn: () => getGestorConsolidations(instanceId),
    enabled: !!instanceId
  })

  const saveConsolidationMutation = useMutation({
    mutationFn: saveGestorConsolidation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestorConsolidations', instanceId] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
      queryClient.invalidateQueries({ queryKey: ['allAuditLogs'] })
    }
  })

  return {
    consolidations: consolidationsQuery.data || [],
    isLoadingConsolidations: consolidationsQuery.isLoading,
    saveConsolidation: saveConsolidationMutation.mutate,
    isSavingConsolidation: saveConsolidationMutation.isPending
  }
}

export function useFinalDeliberations(instanceId) {
  const queryClient = useQueryClient()

  const deliberationsQuery = useQuery({
    queryKey: ['finalDeliberations', instanceId],
    queryFn: () => getFinalDeliberations(instanceId),
    enabled: !!instanceId
  })

  const saveDeliberationMutation = useMutation({
    mutationFn: saveFinalDeliberation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalDeliberations', instanceId] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceTasks'] })
      queryClient.invalidateQueries({ queryKey: ['processInstanceSteps'] })
      queryClient.invalidateQueries({ queryKey: ['allAuditLogs'] })
    }
  })

  return {
    deliberations: deliberationsQuery.data || [],
    isLoadingDeliberations: deliberationsQuery.isLoading,
    saveDeliberation: saveDeliberationMutation.mutate,
    isSavingDeliberation: saveDeliberationMutation.isPending
  }
}

