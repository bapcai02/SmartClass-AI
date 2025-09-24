import api from '@/utils/api'

export type SubjectDto = { id: number; name: string }
export type UserDto = { id: number; name: string; email: string; role?: string }

export async function searchSubjects(term: string, limit = 10) {
  const { data } = await api.get<{ data?: SubjectDto[]; items?: SubjectDto[]; results?: SubjectDto[]; }>(
    '/subjects',
    { params: { search: term || undefined, per_page: limit } }
  )
  return (data?.data || data?.items || (data as any)?.results || []) as SubjectDto[]
}

export async function searchUsers(term: string, role?: string, limit = 10) {
  const { data } = await api.get<{ data?: UserDto[]; items?: UserDto[]; results?: UserDto[]; }>(
    '/users',
    { params: { search: term || undefined, role: role || undefined, per_page: limit } }
  )
  return (data?.data || data?.items || (data as any)?.results || []) as UserDto[]
}


