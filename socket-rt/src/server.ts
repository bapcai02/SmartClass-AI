import { createServer } from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { Redis } from 'ioredis'
import fetch from 'node-fetch'

const PORT = Number(process.env.RT_PORT || 8092)
const API_BASE = process.env.API_BASE || 'http://web/api'
const REDIS_HOST = process.env.REDIS_HOST || 'redis'
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379)

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  }
})

// Redis adapter for scale-out
const pubClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT })
const subClient = pubClient.duplicate()
io.adapter(createAdapter(pubClient, subClient))

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.toString().replace(/^Bearer\s+/i, '')
  if (!token) return next(new Error('unauthorized'))
  ;(socket as any).token = token
  next()
})

io.on('connection', (socket) => {
  // join conversation room(s)
  socket.on('join_conversation', (conversationId: number) => {
    if (!conversationId) return
    socket.join(`conversation:${conversationId}`)
  })

  socket.on('send_message', async (payload: { conversationId:number; content?:string; message_type?:string; file_url?:string }) => {
    const token: string = (socket as any).token
    if (!payload?.conversationId || (!payload.content && !payload.file_url)) return
    try {
      const resp = await fetch(`${API_BASE}/chat/conversations/${payload.conversationId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: payload.content, message_type: payload.message_type || 'text', file_url: payload.file_url })
      })
      if (!resp.ok) return
      const data = await resp.json()
      // client will also get Reverb broadcast; local emit optional
      io.to(`conversation:${payload.conversationId}`).emit('message_echo', data)
    } catch {}
  })
})

httpServer.listen(PORT, () => {
  console.log(`Socket RT listening on :${PORT} with Redis adapter → ${REDIS_HOST}:${REDIS_PORT}`)
})


