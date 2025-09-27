import api from '@/utils/api'

export type QaPost = {
  id: number
  user_id: number
  question_text: string
  image_url?: string | null
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
  }
  answers: QaAnswer[]
}

export type QaAnswer = {
  id: number
  qa_post_id: number
  user_id: number
  answer_text: string
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
  }
  post?: {
    id: number
    question_text: string
    user: {
      id: number
      name: string
      email: string
    }
  }
}

export type QaStats = {
  total_questions: number
  total_answers: number
  recent_questions: number
  recent_answers: number
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export async function getAllQaPosts(params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 15 } = params
  const { data } = await api.get<Paginated<QaPost>>('/qa', { 
    params: { page, per_page: perPage } 
  })
  return data
}

export async function getMyQaPosts(params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 15 } = params
  const { data } = await api.get<Paginated<QaPost>>('/qa/my-posts', { 
    params: { page, per_page: perPage } 
  })
  return data
}

export async function getMyQaAnswers(params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 15 } = params
  const { data } = await api.get<Paginated<QaAnswer>>('/qa/my-answers', { 
    params: { page, per_page: perPage } 
  })
  return data
}

export async function getQaStats() {
  const { data } = await api.get<QaStats>('/qa/my-stats')
  return data
}

export async function getQaPost(id: number | string) {
  const { data } = await api.get<QaPost>(`/qa/${id}`)
  return data
}

export async function createQaPost(payload: { question_text: string; image_url?: string }) {
  const { data } = await api.post<QaPost>('/qa', payload)
  return data
}

export async function createQaAnswer(postId: number | string, payload: { answer_text: string }) {
  const { data } = await api.post<QaAnswer>(`/qa/${postId}/answers`, payload)
  return data
}

export async function updateQaPost(id: number | string, payload: { question_text?: string; image_url?: string }) {
  const { data } = await api.put<QaPost>(`/qa/posts/${id}`, payload)
  return data
}

export async function updateQaAnswer(id: number | string, payload: { answer_text: string }) {
  const { data } = await api.put<QaAnswer>(`/qa/answers/${id}`, payload)
  return data
}

export async function deleteQaPost(id: number | string) {
  const { data } = await api.delete(`/qa/posts/${id}`)
  return data
}

export async function deleteQaAnswer(id: number | string) {
  const { data } = await api.delete(`/qa/answers/${id}`)
  return data
}
