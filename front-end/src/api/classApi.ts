import api from '@/utils/api'

export type ClassroomDto = {
  id: number
  name: string
  subject_id?: number | null
  teacher_id?: number | null
  description?: string | null
  subject?: { id: number; name: string }
  teacher?: { id: number; name: string; email: string }
  students_count?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
} | {
  items: T[]
  meta: { current_page: number; per_page: number; total: number; last_page: number }
}

export async function getClasses(params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 10 } = params
  const { data } = await api.get<PaginatedResponse<ClassroomDto>>('/classes', {
    params: { page, per_page: perPage },
  })
  return data
}

export async function getClassById(id: number | string) {
  const { data } = await api.get<ClassroomDto>(`/classes/${id}`)
  return data
}

export async function createClass(payload: Partial<ClassroomDto>) {
  const { data } = await api.post<ClassroomDto>('/classes', payload)
  return data
}

export async function updateClass(id: number | string, payload: Partial<ClassroomDto>) {
  const { data } = await api.put<ClassroomDto>(`/classes/${id}`, payload)
  return data
}

export async function deleteClass(id: number | string) {
  const { data } = await api.delete(`/classes/${id}`)
  return data
}


