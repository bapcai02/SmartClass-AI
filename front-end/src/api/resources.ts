import api from '@/utils/api'

export type Resource = {
  id: number
  class_id: number
  title: string
  file_url: string
  uploaded_by: number
  uploaded_at: string
  created_at: string
  updated_at: string
  class_room: {
    id: number
    name: string
    subject: {
      id: number
      name: string
      code: string
    }
  }
  uploader: {
    id: number
    name: string
    email: string
  }
}

export type ResourceStats = {
  total: number
  pdf: number
  doc: number
  image: number
  video: number
  other: number
}

export type ResourceFilters = {
  search?: string
  class_id?: number
  subject_id?: number
  uploaded_by?: number
  file_type?: 'pdf' | 'doc' | 'image' | 'video' | 'other'
  date_from?: string
  date_to?: string
  page?: number
  perPage?: number
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export async function getAllResources(params: ResourceFilters = {}) {
  const { page = 1, perPage = 15, ...filters } = params
  const { data } = await api.get<Paginated<Resource>>('/resources', { 
    params: { page, per_page: perPage, ...filters } 
  })
  return data
}

export async function getResourceStats() {
  const { data } = await api.get<ResourceStats>('/resources/stats')
  return data
}

export async function getRecentResources(limit: number = 10) {
  const { data } = await api.get<Resource[]>(`/resources/recent?limit=${limit}`)
  return data
}

export async function getResourcesByClass(classId: number | string, params: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 15 } = params
  const { data } = await api.get<Paginated<Resource>>(`/resources/class/${classId}`, { 
    params: { page, per_page: perPage } 
  })
  return data
}

export async function getResource(id: number | string) {
  const { data } = await api.get<Resource>(`/resources/${id}`)
  return data
}

export async function createResource(payload: {
  class_id: number
  title: string
  file_url: string
  uploaded_by: number
}) {
  const { data } = await api.post<Resource>('/resources', payload)
  return data
}

export async function updateResource(id: number | string, payload: {
  title?: string
  file_url?: string
}) {
  const { data } = await api.put<Resource>(`/resources/${id}`, payload)
  return data
}

export async function deleteResource(id: number | string) {
  const { data } = await api.delete(`/resources/${id}`)
  return data
}

export function getFileTypeFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return 'pdf'
    case 'doc':
    case 'docx':
      return 'doc'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image'
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'video'
    default:
      return 'other'
  }
}

export function getFileIcon(fileType: string): string {
  switch (fileType) {
    case 'pdf':
      return '📄'
    case 'doc':
      return '📝'
    case 'image':
      return '🖼️'
    case 'video':
      return '🎥'
    default:
      return '📎'
  }
}
