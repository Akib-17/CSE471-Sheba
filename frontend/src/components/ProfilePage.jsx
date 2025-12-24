import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getSocket } from '../services/socket'

const PROVIDER_CATEGORIES = ['electrician', 'plumber', 'barber', 'housemaid', 'ac repair', 'fridge repair', 'women salon care']
const LOCATIONS = ['Badda', 'Aftabnagar', 'Middle Badda', 'Gulsan', 'Mohakhali', 'Banani', 'Notunbazar', 'Rampura', 'Banashree', 'Motijheel', 'Mirpur 1', 'Mirpur 2', 'Mirpur 10']

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: '', location: '', skills: '', service_area: '', profile_photo: '',
    nid: '', partner_category: '', partner_locations: [], fee_min: '', fee_max: '', provider_unique_id: '', role: '',
    is_premium: false, subscription_expiry: null
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [notifications, setNotifications] = useState([])
  const [warnings, setWarnings] = useState([])
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/profile')
        const data = res.data
        data.partner_locations = data.partner_locations || []
        setProfile(prev => ({ ...prev, ...data }))
        setLoading(false)

        if (data.role === 'provider') {
          loadWarnings()
          loadComplaints()
        }
      } catch (e) {
        // if 401, redirect to login?
      }
    }
    loadNotifications()
    load()

    const socket = getSocket()
    socket.on('connect', () => console.log('SocketIO connected'))
    socket.on('notification', () => {
      loadNotifications()
      if (profile.role === 'provider') {
        loadWarnings()
        loadComplaints()
      }
    })
    return () => {
      socket.off('connect')
      socket.off('notification')
    }
  }, [])

  async function loadWarnings() { try { const res = await api.get('/warnings'); setWarnings(res.data || []) } catch (e) { } }
  async function loadComplaints() { try { const res = await api.get('/complaints'); setComplaints(res.data || []) } catch (e) { } }
  async function loadNotifications() { try { const res = await api.get('/notifications'); setNotifications(res.data || []) } catch (e) { } }
  async function markAsRead(notifId) { try { await api.post(`/notifications/${notifId}/mark_read`); loadNotifications() } catch (e) { } }

  function toggleLocation(loc) {
    setProfile(prev => {
      const arr = prev.partner_locations || []
      let next
      if (arr.includes(loc)) next = arr.filter(x => x !== loc)
      else {
        if (arr.length >= 3) return prev
        next = [...arr, loc]
      }
      return { ...prev, partner_locations: next }
    })
  }

  async function saveProfile(e) {
    e && e.preventDefault()
    try {
      const payload = {
        name: profile.name,
        location: profile.location,
        service_area: profile.service_area,
        profile_photo: profile.profile_photo,
        // Provider fields - only send if valid or relevant, but API handles updates safely
        nid: profile.nid,
        partner_category: profile.partner_category,
        partner_locations: profile.partner_locations,
        fee_min: profile.fee_min,
        fee_max: profile.fee_max
      }

      const res = await api.put('/profile', payload)
      setMessage('✓ Profile Updated Successfully')
      setProfile(prev => ({ ...prev, ...res.data }))

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setMessage('✗ ' + (err?.response?.data?.msg || 'Error saving'))
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading profile...</div>

  return (
    <div className="grid">
      <div className="card">
        <div className="header-row">
          <h3 style={{ marginTop: 0 }}>
            {profile.role === 'provider' ? 'Provider Profile' : 'User Profile'}
          </h3>
          <div className="space">
            {/* Edit mode removed, always editable */}
          </div>
        </div>

        {/* Premium Badge */}
        <div style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: 8, marginTop: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            Status: {profile.is_premium ? <span style={{ color: 'goldenrod' }}>Premium Member 🌟</span> : <span>Free Plan</span>}
          </div>
          {!profile.is_premium && (
            <button className="btn small" style={{ background: 'goldenrod', border: 'none' }} onClick={() => navigate('/premium-offer')}>
              Upgrade
            </button>
          )}
        </div>

        <form style={{ marginTop: 8 }} onSubmit={saveProfile}>
          {/* Common Fields */}
          <div className="form-row" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: '0 0 80px' }}>
              <img src={profile.profile_photo || '/placeholder.png'} alt="photo" className="photo" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Full name</label>
              <input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <label>Profile photo (URL)</label>
            <input value={profile.profile_photo || ''} onChange={e => setProfile({ ...profile, profile_photo: e.target.value })} />
          </div>

          {/* User Specific Form */}
          {profile.role === 'user' && (
            <>
              <div className="form-row">
                <label>House address / Area</label>
                <select value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })}>
                  <option value="">Select Area</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Provider Specific Form */}
          {profile.role === 'provider' && (
            <div style={{ borderTop: '1px solid #eee', marginTop: 20, paddingTop: 20 }}>
              <div className="form-row">
                <label>Provider Unique ID</label>
                <input value={profile.provider_unique_id || 'Not assigned yet'} disabled style={{ background: '#f3f4f6' }} />
              </div>

              <div className="form-row">
                <label>National ID (NID)</label>
                <input
                  value={profile.nid || ''}
                  onChange={e => setProfile({ ...profile, nid: e.target.value })}
                  disabled={profile.nid && profile.nid.length > 5}
                  title="NID locked after submission"
                  placeholder="Enter your National ID Number"
                />
                {profile.nid && <div className="small muted">NID Verified. Contact admin to update.</div>}
              </div>

              <div className="form-row">
                <label>Service Category</label>
                <select value={profile.partner_category || ''} onChange={e => setProfile({ ...profile, partner_category: e.target.value })} required>
                  <option value="">-- Select Category --</option>
                  {PROVIDER_CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>

              <div className="form-row">
                <label>Service Areas (Max 3)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
                  {LOCATIONS.map(loc => (
                    <label key={loc} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={(profile.partner_locations || []).includes(loc)} onChange={() => toggleLocation(loc)} />
                      <span className="small">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label>Service Fee Range (BDT)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" value={profile.fee_min || ''} onChange={e => setProfile({ ...profile, fee_min: Number(e.target.value) })} placeholder="Min" />
                  <span style={{ alignSelf: 'center' }}>-</span>
                  <input type="number" value={profile.fee_max || ''} onChange={e => setProfile({ ...profile, fee_max: Number(e.target.value) })} placeholder="Max" />
                </div>
              </div>
            </div>
          )}

          <div className="form-row" style={{ marginTop: 24 }}>
            <button className="btn" type="submit" style={{ width: '100%', padding: 12, fontSize: '1rem' }}>Update Profile</button>
          </div>
          <div className={`form-row small ${message.startsWith('✓') ? '' : 'muted'}`} style={{ color: message.startsWith('✓') ? 'green' : 'inherit' }}>{message}</div>
        </form>
      </div>

      {/* Common: Notifications */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Notifications</h3>
        {notifications.length === 0 ? <p className="muted">No notifications.</p> : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.map(notif => (
              <div key={notif.id} style={{ padding: 12, marginBottom: 8, border: '1px solid #eee', borderRadius: 4, backgroundColor: notif.is_read ? '#f9f9f9' : '#fff', cursor: 'pointer' }} onClick={() => !notif.is_read && markAsRead(notif.id)}>
                <div style={{ fontWeight: notif.is_read ? 'normal' : 'bold' }}>{notif.message}</div>
                <div className="small muted">{new Date(notif.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Provider Specific: Complaints/Warnings */}
      {profile.role === 'provider' && (
        <>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Complaints</h3>
            {complaints.length === 0 && <p className="muted">No complaints found.</p>}
            {complaints.map(c => (
              <div key={c.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
                <strong>{c.title}</strong> - <span className="small">{c.status}</span>
                <div className="small muted">{c.description}</div>
              </div>
            ))}
          </div>
          {warnings.length > 0 && (
            <div className="card">
              <h3 style={{ marginTop: 0, color: 'red' }}>Warnings</h3>
              {warnings.map(w => (
                <div key={w.id} style={{ background: '#FFF5F5', padding: 10, border: '1px solid #FECACA', marginBottom: 8 }}>
                  {w.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Support Button for Everyone */}
      <button onClick={() => navigate('/complaint')} style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--primary)', color: 'white', borderRadius: 50, padding: '12px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 8, zIndex: 100 }}>
        <span>💬</span> Support
      </button>
    </div>
  )
}
