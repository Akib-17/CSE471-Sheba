import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useLocation, useNavigate } from 'react-router-dom'

export default function RequestPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // Available categories
  const categories = ['electrician', 'barber', 'ac repair', 'plumber', 'fridge repair', 'cleaner', 'shifting']

  const [form, setForm] = useState({
    category: state?.category || '',
    description: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/service_requests', form)
      setMessage('Request submitted successfully! We are searching for providers...')
      setForm({ category: '', description: '' })
      // Optional: redirect to dashboard after delay
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err) {
      setMessage('Error submitting request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <div className="card">
        <h2 className="text-center" style={{ marginBottom: 24 }}>Request a Service</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Service Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Describe your issue in detail e.g. 'AC not cooling properly'"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-row" style={{ marginTop: 24 }}>
            <button className="btn" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Find Provider'}
            </button>
            {message && <div style={{ marginTop: 16, textAlign: 'center', color: message.includes('Error') ? 'red' : 'green' }}>{message}</div>}
          </div>
        </form>
      </div>
    </div>
  )
}
