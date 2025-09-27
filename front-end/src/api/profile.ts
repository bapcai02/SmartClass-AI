import api from '@/utils/api'

export type User = {
  id: number
  name: string
  email: string
  role: string
  avatar_url?: string | null
  bio?: string | null
  created_at: string
  updated_at: string
}

export type UserStats = {
  assignments: {
    total: number
    completed: number
    average_grade: number
  }
  exams: {
    total: number
    completed: number
    average_grade: number
  }
  qa: {
    questions: number
    answers: number
  }
  resources: {
    uploaded: number
  }
  classes: {
    enrolled: number
  }
  recent_activity: {
    assignments: number
    exams: number
    questions: number
    answers: number
  }
}

export type UserActivity = {
  type: 'assignment_submission' | 'exam_submission' | 'question' | 'answer'
  title: string
  description: string
  grade?: number
  date: string
}

export async function getProfile() {
  const { data } = await api.get<User>('/profile')
  return data
}

export async function updateProfile(payload: {
  name?: string
  email?: string
  bio?: string
  avatar_url?: string
}) {
  const { data } = await api.put<User>('/profile', payload)
  return data
}

export async function updatePassword(payload: {
  current_password: string
  new_password: string
  new_password_confirmation: string
}) {
  const { data } = await api.put('/profile/password', payload)
  return data
}

export async function getProfileStats() {
  const { data } = await api.get<UserStats>('/profile/stats')
  return data
}

export async function getProfileActivity(limit: number = 10) {
  const { data } = await api.get<UserActivity[]>(`/profile/activity?limit=${limit}`)
  return data
}
