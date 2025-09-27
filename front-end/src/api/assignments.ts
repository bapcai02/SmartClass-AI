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

export type AssignmentWithDetails = AssignmentDto & {
  class_room: {
    id: number
    name: string
    subject: {
      id: number
      name: string
    }
  }
  creator: {
    id: number
    name: string
    email: string
  }
  submissions: Array<{
    id: number
    student_id: number
    grade?: number | null
    submitted_at?: string | null
  }>
}

export type AssignmentFilters = {
  page?: number
  perPage?: number
  search?: string
  class_id?: number
  subject_id?: number
  status?: 'overdue' | 'due_today' | 'due_this_week' | 'upcoming'
  created_by?: number
  date_from?: string
  date_to?: string
}

export type AssignmentStats = {
  total: number
  overdue: number
  due_today: number
  due_this_week: number
  upcoming: number
}

export async function getAllAssignments(params: AssignmentFilters = {}) {
  const { page = 1, perPage = 15, ...filters } = params
  const { data } = await api.get<Paginated<AssignmentWithDetails>>('/assignments', { 
    params: { page, per_page: perPage, ...filters } 
  })
  return data
}

export async function getAssignmentStats() {
  const { data } = await api.get<AssignmentStats>('/assignments/stats')
  return data
}


