import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProcessesByUser, createProcess, getProcessTypes, getProcessById, getProcessEvents } from '../api/processes'


export function useProcesses(userId) {
  return useQuery({
    queryKey: ['processes', userId],
    queryFn: () => getProcessesByUser(userId),
    enabled: !!userId
  })
}

export function useProcessTypes() {
  return useQuery({
    queryKey: ['processTypes'],
    queryFn: getProcessTypes
  })
}

export function useCreateProcess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProcess,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['processes', variables.userId] })
    }
  })
}

export function useProcessDetails(processId) {
  return useQuery({
    queryKey: ['process', processId],
    queryFn: () => getProcessById(processId),
    enabled: !!processId
  })
}

export function useProcessEvents(processId) {
  return useQuery({
    queryKey: ['processEvents', processId],
    queryFn: () => getProcessEvents(processId),
    enabled: !!processId
  })
}

