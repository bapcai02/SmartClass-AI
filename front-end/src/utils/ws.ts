import Pusher from 'pusher-js'

let pusher: Pusher | null = null

export function initPusher(): Pusher {
  if (pusher) return pusher
  const key = (import.meta as any)?.env?.VITE_REVERB_KEY || 'local'
  const host = (import.meta as any)?.env?.VITE_REVERB_HOST || '127.0.0.1'
  const port = Number((import.meta as any)?.env?.VITE_REVERB_PORT || 8090)
  const scheme = (import.meta as any)?.env?.VITE_REVERB_SCHEME || 'http'
  const authEndpoint = ((import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8081/api') + '/broadcasting/auth'

  pusher = new Pusher(key, {
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    cluster: 'mt1',
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    },
  })
  return pusher
}

export function getPusher(): Pusher {
  return initPusher()
}


