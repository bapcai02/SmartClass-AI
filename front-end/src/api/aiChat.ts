import api from '@/utils/api'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isTyping?: boolean
}

export type ChatRequest = {
  message: string
  conversation_history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  context?: string
  session_id?: number
}

export type ChatResponse = {
  success: boolean
  response?: string
  error?: string
  session_id?: number
  timestamp: string
}

export type Suggestion = {
  suggestions: string[]
}

export type Context = {
  current_classes: string[]
  recent_topics: string[]
  upcoming_assignments: string[]
}

export type ChatSession = {
  id: number
  title: string
  total_messages: number
  last_message_at: string
  is_active: boolean
}

export type ChatConversation = {
  id: number
  message: string
  response?: string
  message_type: 'user' | 'assistant'
  created_at: string
}

export type SessionResponse = {
  session: ChatSession
  conversations: ChatConversation[]
}

export type SessionsResponse = {
  sessions: ChatSession[]
}

export type ChatStats = {
  total_sessions: number
  total_messages: number
  active_sessions: number
  recent_activity: Array<{
    message: string
    response?: string
    created_at: string
  }>
}

export async function sendMessage(payload: ChatRequest) {
  const { data } = await api.post<ChatResponse>('/ai/chat', payload)
  return data
}

export async function getSuggestions() {
  const { data } = await api.get<Suggestion>('/ai/suggestions')
  return data
}

export async function getContext() {
  const { data } = await api.get<Context>('/ai/context')
  return data
}

export async function getSessions() {
  const { data } = await api.get<SessionsResponse>('/ai/sessions')
  return data
}

export async function getSession(sessionId: number) {
  const { data } = await api.get<SessionResponse>(`/ai/sessions/${sessionId}`)
  return data
}

export async function createSession(payload: { title?: string; context?: string }) {
  const { data } = await api.post<{ session: ChatSession }>('/ai/sessions', payload)
  return data
}

export async function deleteSession(sessionId: number) {
  const { data } = await api.delete(`/ai/sessions/${sessionId}`)
  return data
}

export async function getChatStats() {
  const { data } = await api.get<ChatStats>('/ai/stats')
  return data
}
