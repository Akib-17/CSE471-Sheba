import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', role: 'user' })
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  async function register(e) {
    e.preventDefault()
    try {
      const res = await api.post('/auth/register', form)

      // If provider, maybe auto-login and redirect to profile?
      // User requested: "if new user register add them accordingly... directly take them to the providere form"
      // To do this, we should probably auto-login.
      // But standard security suggests login first. 
      // User said "add login button after the user fillout", so manual login seems expected.
      // But also "directly take them to the provider form".
      // Let's try to auto-login if provider.

      try {
        await api.post('/auth/login', { username: form.username, password: form.password })
        if (form.role === 'provider') {
          navigate('/profile?edit=partner')
        } else {
          navigate('/')
        }
      } catch (loginErr) {
        // If auto-login fails, fallback to manual
        setMsg('Registered! Please login.')
        navigate('/login')
      }

    } catch (err) {
      setMsg('Registration failed: ' + (err.response?.data?.msg || err.message))
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Create Account</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
        <button
          type="button"
          className={`btn ${form.role === 'user' ? '' : 'secondary'}`}
          onClick={() => setForm({ ...form, role: 'user' })}
          style={{ flex: 1 }}
        >
          User
        </button>
        <button
          type="button"
          className={`btn ${form.role === 'provider' ? '' : 'secondary'}`}
          onClick={() => setForm({ ...form, role: 'provider' })}
          style={{ flex: 1 }}
        >
          Service Provider
        </button>
      </div>

      <form onSubmit={register} style={{ marginTop: 12 }}>
        <div className="form-row">
          <label>Full Name</label>
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-row">
          <label>Email (Optional)</label>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-row">
          <label>Username</label>
          <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="form-row">
          <button className="btn" type="submit" style={{ width: '100%' }}>Register & Login</button>
        </div>

        {msg && <div style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>{msg}</div>}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login here</Link>
        </div>
      </form>
    </div>
  )
}
