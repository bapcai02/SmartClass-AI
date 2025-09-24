import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/utils/api'

type LoginPayload = { email: string; password: string }
type LoginResponse = { user: any; token: string }

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<LoginResponse>('/login', payload)
      return data
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token)
      try {
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      } catch {}
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/me')
      return data
    },
    enabled: Boolean(localStorage.getItem('auth_token')),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/logout')
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      queryClient.clear()
    },
  })
}


