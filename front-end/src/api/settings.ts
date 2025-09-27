import api from '@/utils/api'

export type UserSettings = {
  notifications: {
    email_notifications: boolean
    assignment_reminders: boolean
    exam_reminders: boolean
    grade_updates: boolean
    announcement_notifications: boolean
  }
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private'
    show_email: boolean
    show_activity: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    language: 'en' | 'vi' | 'es' | 'fr'
    timezone: string
  }
  account: {
    two_factor_enabled: boolean
    login_notifications: boolean
  }
}

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

export type ExportData = {
  user_info: {
    name: string
    email: string
    role: string
    created_at: string
  }
  message: string
  exported_at: string
}

export async function getSettings() {
  const { data } = await api.get<UserSettings>('/settings')
  return data
}

export async function updateSettings(settings: Partial<UserSettings>) {
  const { data } = await api.put<{ message: string; settings: UserSettings }>('/settings', settings)
  return data
}

export async function updateProfile(payload: {
  name?: string
  email?: string
  bio?: string
  avatar_url?: string
}) {
  const { data } = await api.put<{ message: string; user: User }>('/settings/profile', payload)
  return data
}

export async function updatePassword(payload: {
  current_password: string
  new_password: string
  new_password_confirmation: string
}) {
  const { data } = await api.put<{ message: string }>('/settings/password', payload)
  return data
}

export async function deleteAccount(payload: {
  password: string
  confirmation: string
}) {
  const { data } = await api.delete<{ message: string }>('/settings/account', { data: payload })
  return data
}

export async function exportData() {
  const { data } = await api.get<ExportData>('/settings/export')
  return data
}
