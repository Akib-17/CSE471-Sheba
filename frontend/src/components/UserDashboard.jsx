import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { getSocket } from '../services/socket'
import ServiceChat from './ServiceChat'

export default function UserDashboard() {
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [rating, setRating] = useState({ id: null, sc: 5, review: '' })

  useEffect(() => {
    loadUser()
    loadRequests()
    loadNotifications()

    const socket = getSocket()
    socket.on('connect', () => console.log('Socket connected'))
    socket.on('notification', () => {
      loadNotifications()
      loadRequests()
    })

    return () => {
      socket.off('connect')
      socket.off('notification')
    }
  }, [])

  async function loadUser() {
    try {
      const res = await api.get('/auth/me')
      setCurrentUser(res.data.user)
    } catch (e) { }
  }

  async function loadRequests() {
    try {
      const res = await api.get('/service_requests')
      setRequests(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data || [])
    } catch (e) { }
  }

  async function submitRating(requestId) {
    try {
      await api.post(`/service_requests/${requestId}/rate`, {
        rating: rating.sc,
        review: rating.review
      })
      setRating({ id: null, sc: 5, review: '' })
      loadRequests()
    } catch (e) {
      alert('Error submitting rating')
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>My Service Requests</h2>
        {requests.length === 0 && <p className="muted">You haven't created any service requests yet.</p>}
        {requests.map(r => (
          <div key={r.id} style={{ border: '1px solid #eee', padding: 16, marginBottom: 16, borderRadius: 8, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{r.category}</div>
                <div style={{ color: '#666' }}>{r.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${r.status === 'accepted' ? 'green' : r.status === 'completed' ? 'yellow' : ''}`}>{r.status}</span>
              </div>
            </div>

            <div className="flex" style={{ marginTop: 12 }}>
              {r.status === 'accepted' && (
                <button className="btn" onClick={() => setActiveChat(activeChat === r.id ? null : r.id)}>
                  {activeChat === r.id ? 'Close Chat' : 'Chat with Provider'}
                </button>
              )}

              {r.status === 'completed' && !r.rating && (
                <button className="btn outline" onClick={() => setRating({ ...rating, id: r.id })}>
                  Rate Service
                </button>
              )}

              {r.status === 'completed' && r.rating && (
                <span className="small muted">You rated: {r.rating}⭐</span>
              )}
            </div>

            {/* Rating Form */}
            {rating.id === r.id && (
              <div style={{ marginTop: 12, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                <label>Rate (1-5)</label>
                <div style={{ marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}
                      style={{ cursor: 'pointer', fontSize: 24, color: star <= rating.sc ? 'goldenrod' : '#ccc' }}
                      onClick={() => setRating({ ...rating, sc: star })}
                    >★</span>
                  ))}
                </div>
                <textarea
                  placeholder="Write a review..."
                  value={rating.review}
                  onChange={e => setRating({ ...rating, review: e.target.value })}
                />
                <div className="flex" style={{ marginTop: 8 }}>
                  <button className="btn" onClick={() => submitRating(r.id)}>Submit Rating</button>
                  <button className="btn secondary" onClick={() => setRating({ id: null, sc: 5, review: '' })}>Cancel</button>
                </div>
              </div>
            )}

            {/* Chat Area */}
            {activeChat === r.id && currentUser && (
              <div style={{ marginTop: 16 }}>
                <ServiceChat
                  requestId={r.id}
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notifications Sidebar */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Notifications</h3>
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {notifications.length === 0 && <div className="muted">No notifications</div>}
          {notifications.map(n => (
            <div key={n.id} style={{ padding: 10, borderBottom: '1px solid #eee', background: n.is_read ? 'transparent' : '#f0f9ff' }}>
              <div style={{ fontSize: '0.9rem' }}>{n.message}</div>
              <div className="small muted" style={{ marginTop: 4 }}>{new Date(n.created_at).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

