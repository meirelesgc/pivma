import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProcessesByUser, createProcess } from '../api/processes'

export function useProcesses(userId) {
  return useQuery({
    queryKey: ['processes', userId],
    queryFn: () => getProcessesByUser(userId),
    enabled: !!userId
  })
}

export function useCreateProcess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProcess,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['processes', variables.userId] })
    }
  })
}
