import { useQuery } from '@tanstack/react-query'
import { getProcessesByUser } from '../api/processes'

export function useProcesses(userId) {
  return useQuery({
    queryKey: ['processes', userId],
    queryFn: () => getProcessesByUser(userId),
    enabled: !!userId
  })
}
