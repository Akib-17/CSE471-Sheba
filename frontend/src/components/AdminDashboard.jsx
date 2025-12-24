import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { getSocket } from '../services/socket'
import ChatComponent from './ChatComponent'

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [replyMap, setReplyMap] = useState({})
  const [warnMap, setWarnMap] = useState({})
  const [message, setMessage] = useState('')
  const [activeChatId, setActiveChatId] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data.user)).catch(e => { })
  }, [])

  useEffect(() => {
    loadComplaints()
    const socket = getSocket()
    socket.on('complaint_update', () => loadComplaints())
    return () => socket.off('complaint_update')
  }, [statusFilter])

  async function loadComplaints() {
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const res = await api.get('/complaints', { params })
      setComplaints(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function reply(id) {
    const text = replyMap[id] || ''
    if (!text.trim()) {
      setMessage('✗ Reply text required')
      return
    }
    try {
      await api.post(`/complaints/${id}/reply`, { response: text })
      setMessage('✓ Reply sent')
      setReplyMap(prev => ({ ...prev, [id]: '' }))
      loadComplaints()
    } catch (err) {
      const m = err?.response?.data?.msg || err?.message || 'Error replying'
      setMessage('✗ ' + m)
    }
  }

  async function warn(id, provider_id) {
    const text = warnMap[id] || ''
    if (!text.trim()) {
      setMessage('✗ Warning message required')
      return
    }
    try {
      await api.post(`/complaints/${id}/warn_provider`, { message: text })
      setMessage('✓ Warning sent')
      setWarnMap(prev => ({ ...prev, [id]: '' }))
      loadComplaints()
    } catch (err) {
      const m = err?.response?.data?.msg || err?.message || 'Error warning provider'
      setMessage('✗ ' + m)
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus })
      loadComplaints()
    } catch (err) {
      console.error(err)
      setMessage('Error updating status')
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Admin Dashboard</h2>
          <div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
        <div className="muted" style={{ marginTop: 4 }}>{message}</div>
      </div>

      {complaints.length === 0 && <div className="card"><p className="muted">No complaints.</p></div>}

      {complaints.map(c => (
        <div key={c.id} className="card" style={{ borderColor: c.status === 'pending' ? '#ff9800' : '#ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>{c.title}</h3>
              <div className="small muted">ID #{c.id} • {new Date(c.created_at).toLocaleString()}</div>
              <div className="small muted">ID #{c.id} • {new Date(c.created_at).toLocaleString()}</div>
              <div className="small" style={{ marginTop: 4 }}>
                Status:
                <select
                  value={c.status}
                  onChange={e => updateStatus(c.id, e.target.value)}
                  style={{ marginLeft: 8, padding: '2px 4px', borderRadius: 4 }}
                >
                  <option value="pending">Pending</option>
                  <option value="progress">In Progress</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {c.provider_unique_id && <div><strong>Provider ID:</strong> {c.provider_unique_id}</div>}
              {c.provider_username && <div className="small muted">{c.provider_username}</div>}
              {c.user_username && <div className="small">By: {c.user_username}</div>}
            </div>
          </div>
          <div style={{ marginTop: 8 }}>{c.description}</div>
          {c.admin_response && (
            <div style={{ marginTop: 8, padding: 8, borderRadius: 4, background: '#f5f8ff', border: '1px solid #d6e4ff' }}>
              <strong>Latest reply:</strong> {c.admin_response}
            </div>
          )}

          {c.status !== 'reviewed' && (
            <div style={{ marginTop: 12 }}>
              <button className="btn secondary" onClick={() => setActiveChatId(activeChatId === c.id ? null : c.id)}>
                {activeChatId === c.id ? 'Close Chat' : 'Open Chat'}
              </button>
              {activeChatId === c.id && user && (
                <ChatComponent complaintId={c.id} currentUser={user} initialStatus={c.status} />
              )}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <label className="small muted">Reply to user</label>
            <textarea value={replyMap[c.id] || ''} onChange={e => setReplyMap(prev => ({ ...prev, [c.id]: e.target.value }))} rows={2} />
            <button className="btn" onClick={() => reply(c.id)}>Send Reply</button>
          </div>

          {c.provider_id && (
            <div style={{ marginTop: 12 }}>
              <label className="small muted">Warn provider</label>
              <textarea value={warnMap[c.id] || ''} onChange={e => setWarnMap(prev => ({ ...prev, [c.id]: e.target.value }))} rows={2} />
              <button className="btn secondary" onClick={() => warn(c.id, c.provider_id)}>Send Warning</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
