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
  assignments_count?: number
  exams_count?: number
  resources_count?: number
  attendance_rate?: number | null
  average_grade?: number | null
  performance_over_time?: Array<{ week: string; score: number }>
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

export async function getClassDetail(
  id: number | string,
  options?: { include?: string[]; perPage?: { students?: number; assignments?: number; exams?: number; resources?: number } }
) {
  const params: Record<string, any> = {}
  if (options?.include?.length) params.include = options.include.join(',')
  if (options?.perPage?.students) params.per_page_students = options.perPage.students
  if (options?.perPage?.assignments) params.per_page_assignments = options.perPage.assignments
  if (options?.perPage?.exams) params.per_page_exams = options.perPage.exams
  if (options?.perPage?.resources) params.per_page_resources = options.perPage.resources
  const { data } = await api.get<ClassroomDto & { students?: Array<{ id: number; name: string; email?: string }>; students_count?: number }>(
    `/classes/${id}/detail`,
    { params }
  )
  return data
}

export async function getClassStudents(
  classId: number | string,
  params: { page?: number; perPage?: number; search?: string } = {}
) {
  const { page = 1, perPage = 10, search } = params
  const { data } = await api.get('/classes/' + classId + '/students', {
    params: { page, per_page: perPage, search: search || undefined },
  })
  return data as {
    data: Array<{ id: number; name: string; email: string }>
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export async function addClassStudents(
  classId: number | string,
  studentIds: Array<number>
) {
  const { data } = await api.post(`/classes/${classId}/students`, { student_ids: studentIds })
  return data
}

export async function removeClassStudents(
  classId: number | string,
  studentIds: Array<number>
) {
  const { data } = await api.delete(`/classes/${classId}/students`, { data: { student_ids: studentIds } })
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


