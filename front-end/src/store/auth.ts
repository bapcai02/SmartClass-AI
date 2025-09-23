import { create } from 'zustand'

type Role = 'Student' | 'Teacher' | 'Parent'

type User = {
  id: string
  name: string
  email: string
  role: Role
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

