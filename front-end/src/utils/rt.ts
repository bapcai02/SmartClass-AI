import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket
  const url = (import.meta as any)?.env?.VITE_RT_URL || 'http://localhost:8092'
  const token = localStorage.getItem('auth_token') || ''
  socket = io(url, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
  })
  return socket
}


