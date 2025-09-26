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

export async function updateClassExam(classId: number | string, id: number | string, payload: Partial<ExamDto>) {
  const { data } = await api.put(`/classes/${classId}/exams/${id}`, payload)
  return data as ExamDto
}

export async function deleteClassExam(classId: number | string, id: number | string) {
  const { data } = await api.delete(`/classes/${classId}/exams/${id}`)
  return data as { message: string }
}


