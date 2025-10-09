import axios, { type InternalAxiosRequestConfig } from 'axios'

const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8081/api'

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
