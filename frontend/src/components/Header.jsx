import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Header() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user)
      } catch (e) { }
    }
    load()
  }, [])

  async function logout() {
    try {
      await api.post('/auth/logout')
      setUser(null)
      navigate('/login')
    } catch (e) {
      console.error(e)
    }
  }

  const isProvider = user && user.role === 'provider'
  const isAdmin = user && user.role === 'admin'
  const isUser = user && !isProvider && !isAdmin // Strict user check

  return (
    <header className="header">
      <div className="container header-row">
        <div className="flex">
          <div className="brand">Sheba</div>
          <nav className="nav" style={{ marginLeft: 16 }}>
            {/* Common Links */}
            {!isProvider && <Link to="/">Home</Link>}

            {/* Admin Links */}
            {isAdmin && (
              <Link to="/admin-dashboard">Admin Dashboard</Link>
            )}

            {/* Provider Links */}
            {isProvider && (
              <>
                <Link to="/provider-dashboard">Dashboard</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}

            {/* User Links */}
            {isUser && (
              <>
                <Link to="/request">Request Service</Link>
                <Link to="/user-dashboard">My Requests</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}


          </nav>
        </div>
        <div className="nav">
          {user ? (
            <>
              <span className="muted">{user.username} ({user.role})</span>
              <button className="btn secondary" style={{ marginLeft: 8 }} onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}
