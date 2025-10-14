import api from '@/utils/api'

export type ConversationParticipant = { id: number; name: string }

export type ConversationListItem = {
  id: number
  type: 'direct' | 'group' | 'class'
  title?: string | null
  created_by: number
  last_message_at?: string | null
  messages_count: number
  participants: ConversationParticipant[]
  last_message?: {
    id: number
    conversation_id: number
    sender_id: number
    content?: string | null
    message_type: 'text' | 'image' | 'file'
    file_url?: string | null
    created_at: string
  } | null
}

export type ConversationThread = {
  conversation: {
    id: number
    type: 'direct' | 'group' | 'class'
    title?: string | null
    participants: ConversationParticipant[]
  }
  messages: {
    data: Array<{
      id: number
      conversation_id: number
      sender: { id: number; name: string }
      content?: string | null
      message_type: 'text' | 'image' | 'file'
      file_url?: string | null
      created_at: string
    }>
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export async function getConversations(limit = 20) {
  const { data } = await api.get<{ items: ConversationListItem[] }>(`/chat/conversations`, { params: { limit } })
  return data.items
}

export async function getConversation(id: number | string, params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 30 } = params
  const { data } = await api.get<ConversationThread>(`/chat/conversations/${id}`, { params: { page, per_page: perPage } })
  return data
}

export async function getOrCreateDirect(userId: number) {
  const { data } = await api.post<{ id: number }>(`/chat/direct`, { user_id: userId })
  return data.id
}

export async function sendChatMessage(conversationId: number | string, payload: { content?: string; message_type?: 'text'|'image'|'file'; file_url?: string }) {
  const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, payload)
  return data as { id:number; conversation_id:number; sender:{id:number; name:string}; content?:string; message_type:'text'|'image'|'file'; file_url?:string; created_at:string }
}

export async function createGroupChat(title: string, participantIds: number[]) {
  const { data } = await api.post<{ id: number }>(`/chat/groups`, { title, participant_ids: participantIds })
  return data.id
}

export async function addParticipants(conversationId: number, userIds: number[]) {
  const { data } = await api.post<{ added: number }>(`/chat/conversations/${conversationId}/participants`, { participant_ids: userIds })
  return data.added
}

export async function removeParticipant(conversationId: number, userId: number) {
  const { data } = await api.delete<{ removed: boolean }>(`/chat/conversations/${conversationId}/participants`, { data: { user_id: userId } })
  return data.removed
}


