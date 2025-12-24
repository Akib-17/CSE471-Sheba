import React, { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import { getSocket } from '../services/socket'

export default function ChatComponent({ complaintId, currentUser, initialStatus }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [status, setStatus] = useState(initialStatus || 'pending')
    const bottomRef = useRef(null)

    useEffect(() => {
        loadMessages()
        const socket = getSocket()

        // Join the complaint room (assuming backend handles this via existing logic or we trigger it)
        // Actually our backend api 'join_complaint' event does this:
        socket.emit('join_complaint', { complaint_id: complaintId })

        socket.on('new_message', (msg) => {
            // confirm it belongs to this complaint
            if (msg.complaint_id === complaintId) {
                setMessages(prev => [...prev, msg])
                scrollToBottom()
            }
        })

        socket.on('status_change', (data) => {
            if (data.complaint_id === complaintId) {
                setStatus(data.status)
            }
        })

        return () => {
            socket.emit('leave_complaint', { complaint_id: complaintId })
            socket.off('new_message')
            socket.off('status_change')
        }
    }, [complaintId])

    function scrollToBottom() {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    async function loadMessages() {
        try {
            const res = await api.get(`/complaints/${complaintId}/messages`)
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
            await api.post(`/complaints/${complaintId}/messages`, { message: newMessage })
            setNewMessage('')
            // Message will be added via socket event
        } catch (e) {
            console.error(e)
        }
    }

    const isClosed = status === 'reviewed'

    return (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, marginTop: 12, background: '#fff' }}>
            <div style={{
                padding: '8px 12px',
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                borderRadius: '8px 8px 0 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Chat Support</span>
                <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: status === 'reviewed' ? '#e0e0e0' : status === 'progress' ? '#d1fae5' : '#fff7ed',
                    color: status === 'reviewed' ? '#757575' : status === 'progress' ? '#065f46' : '#9a3412'
                }}>
                    {status.toUpperCase()}
                </span>
            </div>

            <div style={{ height: 250, overflowY: 'auto', padding: 12, background: '#fff' }}>
                {messages.length === 0 && <div className="muted small" style={{ textAlign: 'center', marginTop: 100 }}>No messages yet</div>}
                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUser.id
                    return (
                        <div key={msg.id || i} style={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            marginBottom: 8
                        }}>
                            <div style={{
                                maxWidth: '70%',
                                padding: '8px 12px',
                                borderRadius: 12,
                                background: isMe ? '#3b82f6' : '#f3f4f6',
                                color: isMe ? '#fff' : '#1f2937',
                                fontSize: 13
                            }}>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                                <div style={{
                                    fontSize: 10,
                                    marginTop: 4,
                                    textAlign: 'right',
                                    opacity: 0.8
                                }}>
                                    {!isMe && <span style={{ marginRight: 4, fontWeight: 'bold' }}>{msg.sender_username}</span>}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={send} style={{ display: 'flex', borderTop: '1px solid #e0e0e0', padding: 8 }}>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={isClosed ? "Chat is closed" : "Type a message..."}
                    disabled={isClosed}
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '0 8px' }}
                />
                <button
                    type="submit"
                    className="btn"
                    disabled={isClosed || !newMessage.trim()}
                    style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        opacity: isClosed ? 0.5 : 1
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    )
}
