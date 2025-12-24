
import React, { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import { getSocket } from '../services/socket'

export default function ServiceChat({ requestId, currentUser }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        if (!requestId) return

        loadMessages()
        const socket = getSocket()

        // Join the service request room
        socket.emit('join_service_request', { request_id: requestId })

        // Listen for new messages
        const handleNewMessage = (msg) => {
            // Confirm it belongs to this request (though room logic should handle this, extra safety)
            if (msg.service_request_id === requestId) {
                setMessages(prev => [...prev, msg])
                scrollToBottom()
            }
        }

        socket.on('new_message', handleNewMessage)

        return () => {
            socket.emit('leave_service_request', { request_id: requestId })
            socket.off('new_message', handleNewMessage)
        }
    }, [requestId])

    function scrollToBottom() {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    async function loadMessages() {
        try {
            const res = await api.get(`/service_requests/${requestId}/messages`)
            setMessages(res.data || [])
            scrollToBottom()
        } catch (e) {
            console.error(e)
        }
    }

    async function send(e) {
        e.preventDefault()
        if (!newMessage.trim()) return
        try {
            await api.post(`/service_requests/${requestId}/messages`, { message: newMessage })
            setNewMessage('')
            // Message will be added via socket event
        } catch (e) {
            console.error(e)
            alert('Failed to send message: ' + (e?.response?.data?.msg || 'Error'))
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 500 }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span>
                <span>Chat History</span>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fff' }}>
                {messages.length === 0 && (
                    <div className="muted small" style={{ textAlign: 'center', marginTop: 40 }}>
                        Start the conversation...
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUser.id
                    return (
                        <div key={msg.id || i} style={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            marginBottom: 12
                        }}>
                            <div style={{
                                maxWidth: '75%',
                                padding: '10px 14px',
                                borderRadius: 16,
                                background: isMe ? '#EF3E5B' : '#F3F4F6', // Primary color for me, gray for them
                                color: isMe ? '#fff' : '#1f2937',
                                fontSize: '0.95rem',
                                borderBottomRightRadius: isMe ? 4 : 16,
                                borderBottomLeftRadius: isMe ? 16 : 4,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    marginTop: 4,
                                    textAlign: 'right',
                                    opacity: 0.8,
                                    color: isMe ? '#ffdce3' : '#6b7280'
                                }}>
                                    {!isMe && <span style={{ marginRight: 6, fontWeight: 600 }}>{msg.sender_username}</span>}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={send} style={{
                padding: 12,
                borderTop: '1px solid #e0e0e0',
                background: '#fff',
                display: 'flex',
                gap: 8
            }}>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        border: '1px solid #e5e7eb',
                        borderRadius: 24,
                        padding: '10px 16px',
                        outline: 'none',
                        background: '#f9fafb'
                    }}
                />
                <button
                    type="submit"
                    className="btn"
                    disabled={!newMessage.trim()}
                    style={{
                        borderRadius: '50%',
                        width: 42,
                        height: 42,
                        padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: !newMessage.trim() ? 0.5 : 1
                    }}
                >
                    ➤
                </button>
            </form>
        </div>
    )
}
