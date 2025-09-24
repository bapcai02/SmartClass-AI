import React from 'react'
import { Navigate } from 'react-router-dom'

type Props = { children: React.ReactNode }

export default function PrivateRoute({ children }: Props) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}


