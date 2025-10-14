import api from '@/utils/api'

export type UserLite = { id: number; name: string; email?: string }

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export async function getUsers(params: { page?: number; perPage?: number; search?: string } = {}) {
  const { page = 1, perPage = 50, search } = params
  const { data } = await api.get<Paginated<UserLite>>('/users', {
    params: { page, per_page: perPage, search: search || undefined },
  })
  return data
}

export async function getMe() {
  const { data } = await api.get<{ id: number; name: string; email: string }>('/me')
  return data
}


