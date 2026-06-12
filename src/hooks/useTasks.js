import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskApi from '../api/tasks'

export function useTaskDetails(taskId) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getTaskDetails(taskId),
    enabled: !!taskId
  })
}

export function useTaskInstance(taskInstanceId) {
  return useQuery({
    queryKey: ['taskInstance', taskInstanceId],
    queryFn: () => taskApi.getTaskInstance(taskInstanceId),
    enabled: !!taskInstanceId
  })
}

export function useTaskInstanceByProcessAndTask(processId, taskId) {
  return useQuery({
    queryKey: ['taskInstance', processId, taskId],
    queryFn: () => taskApi.getTaskInstanceByProcessAndTask(processId, taskId),
    enabled: !!processId && !!taskId
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskInstanceId, userId }) => taskApi.completeTask(taskInstanceId, userId),
    onSuccess: () => {
      // Invalida o cache global de processos e detalhes de qualquer processo
      queryClient.invalidateQueries({ queryKey: ['processes'] })
      queryClient.invalidateQueries({ queryKey: ['process'] })
      // Invalida todas as instâncias de tarefas para garantir que a nova apareça
      queryClient.invalidateQueries({ queryKey: ['taskInstance'] })
    }
  })
}

export function useApproveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskInstanceId, userId }) => taskApi.approveTask(taskInstanceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] })
      queryClient.invalidateQueries({ queryKey: ['process'] })
      queryClient.invalidateQueries({ queryKey: ['taskInstance'] })
    }
  })
}

export function useRejectTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskInstanceId, userId, commentText }) => taskApi.rejectTask(taskInstanceId, userId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] })
      queryClient.invalidateQueries({ queryKey: ['process'] })
      queryClient.invalidateQueries({ queryKey: ['taskInstance'] })
    }
  })
}


export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.uploadDocument,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.task_instance_id] })
    }
  })
}

export function useDocuments(taskInstanceId) {
  return useQuery({
    queryKey: ['documents', taskInstanceId],
    queryFn: () => taskApi.getDocuments(taskInstanceId),
    enabled: !!taskInstanceId
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.addComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.task_instance_id] })
    }
  })
}

export function useComments(taskInstanceId) {
  return useQuery({
    queryKey: ['comments', taskInstanceId],
    queryFn: () => taskApi.getComments(taskInstanceId),
    enabled: !!taskInstanceId
  })
}

export function useUpdateTaskInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskInstanceId, data }) => taskApi.updateTaskInstance(taskInstanceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskInstance', variables.taskInstanceId] })
      queryClient.invalidateQueries({ queryKey: ['process'] })
    }
  })
}

export function useLogProcessEvent() {
  return useMutation({
    mutationFn: taskApi.logProcessEvent
  })
}

export function useFieldFeedbacks(processId) {
  return useQuery({
    queryKey: ['fieldFeedbacks', processId],
    queryFn: () => taskApi.getFieldFeedbacks(processId),
    enabled: !!processId
  })
}

export function useCreateFieldFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.createFieldFeedback,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fieldFeedbacks', variables.process_instance_id] })
    }
  })
}

export function useDeleteFieldFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.deleteFieldFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldFeedbacks'] })
    }
  })
}

export function useDeleteFeedbacksByTaskInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.deleteFeedbacksByTaskInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldFeedbacks'] })
    }
  })
}

export function useRequestAdjustments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ processId, userId }) => taskApi.requestAdjustments(processId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] })
      queryClient.invalidateQueries({ queryKey: ['process'] })
      queryClient.invalidateQueries({ queryKey: ['taskInstance'] })
      queryClient.invalidateQueries({ queryKey: ['fieldFeedbacks'] })
    }
  })
}




