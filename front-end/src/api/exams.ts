import api from '@/utils/api'

export type ExamDto = {
  id: number
  class_id: number
  title: string
  description?: string | null
  start_time: string
  end_time?: string | null
  created_by?: number | null
}

export async function listClassExams(classId: number | string, page = 1, perPage = 20) {
  const { data } = await api.get(`/classes/${classId}/exams`, { params: { page, per_page: perPage } })
  return data as { data: ExamDto[]; total: number; last_page: number }
}

export async function createClassExam(classId: number | string, payload: Partial<ExamDto>) {
  const { data } = await api.post(`/classes/${classId}/exams`, payload)
  return data as ExamDto
}

export async function getClassExam(classId: number | string, id: number | string) {
  const { data } = await api.get(`/classes/${classId}/exams/${id}`)
  return data as ExamDto
}

export type ExamStatsRow = { id: number; name: string; email: string; status: 'taking'|'completed'|'missed'|'upcoming'; grade: number | null; submitted_at: string | null }
export type ExamStatsResponse = { counts: { total: number; taking: number; completed: number; missed: number; upcoming: number }; rows: ExamStatsRow[] }
export async function getClassExamStats(classId: number | string, id: number | string) {
  const { data } = await api.get(`/classes/${classId}/exams/${id}/stats`)
  return data as ExamStatsResponse
}

export async function submitExam(classId: number | string, id: number | string, payload: { student_id: number; answers?: any }) {
  const { data } = await api.post(`/classes/${classId}/exams/${id}/submit`, payload)
  return data as { message: string }
}

export async function updateClassExam(classId: number | string, id: number | string, payload: Partial<ExamDto>) {
  const { data } = await api.put(`/classes/${classId}/exams/${id}`, payload)
  return data as ExamDto
}

export async function deleteClassExam(classId: number | string, id: number | string) {
  const { data } = await api.delete(`/classes/${classId}/exams/${id}`)
  return data as { message: string }
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type ExamFilters = {
  page?: number
  perPage?: number
  search?: string
  class_id?: number
  subject_id?: number
  status?: 'upcoming' | 'ongoing' | 'completed'
  created_by?: number
  date_from?: string
  date_to?: string
}

export type ExamStats = {
  total: number
  upcoming: number
  ongoing: number
  completed: number
}

export type ExamWithDetails = ExamDto & {
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

export async function getAllExams(params: ExamFilters = {}) {
  const { page = 1, perPage = 15, ...filters } = params
  const { data } = await api.get<Paginated<ExamWithDetails>>('/exams', { 
    params: { page, per_page: perPage, ...filters } 
  })
  return data
}

export async function getExamStats() {
  const { data } = await api.get<ExamStats>('/exams/stats')
  return data
}


