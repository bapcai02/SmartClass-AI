import api from '@/utils/api'

export type AssignmentDto = {
  id: number
  class_id: number
  title: string
  description?: string | null
  due_date: string
  created_by?: number | null
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export async function listAssignments(classId: number | string, params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 10 } = params
  const { data } = await api.get<Paginated<AssignmentDto>>(`/classes/${classId}/assignments`, { params: { page, per_page: perPage } })
  return data
}

export async function getAssignment(classId: number | string, id: number | string) {
  const { data } = await api.get<AssignmentDto>(`/classes/${classId}/assignments/${id}`)
  return data
}

export async function createAssignment(classId: number | string, payload: Partial<AssignmentDto>) {
  const { data } = await api.post<AssignmentDto>(`/classes/${classId}/assignments`, payload)
  return data
}

export async function updateAssignment(classId: number | string, id: number | string, payload: Partial<AssignmentDto>) {
  const { data } = await api.put<AssignmentDto>(`/classes/${classId}/assignments/${id}`, payload)
  return data
}

export async function deleteAssignment(classId: number | string, id: number | string) {
  const { data } = await api.delete(`/classes/${classId}/assignments/${id}`)
  return data
}


