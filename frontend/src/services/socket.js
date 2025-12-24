import { io } from 'socket.io-client'

// Use the same base URL as the API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1588/api/v1'
const SOCKET_URL = API_URL.replace('/api/v1', '')

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

