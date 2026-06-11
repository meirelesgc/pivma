import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { login, getMe, logout } from '../api/auth'

export function useAuth() {
  const queryClient = useQueryClient()

  const userQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null)
    }
  })

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate
  }
}
