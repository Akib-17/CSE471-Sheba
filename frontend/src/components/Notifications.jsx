import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function Notifications(){
  const [notifications, setNotifications] = useState([])

  useEffect(()=>{ load() }, [])

  async function load(){
    try{
      const res = await api.get('/notifications')
      setNotifications(res.data)
    }catch(e){
      console.error(e)
    }
  }

  async function markRead(id){
    try{
      await api.post(`/notifications/${id}/mark_read`)
      load()
    }catch(e){
      console.error(e)
    }
  }

  return (
    <div className="card">
      <h2>Notifications</h2>
      {notifications.length===0 && <p>No notifications.</p>}
      {notifications.map(n=>(
        <div key={n.id} style={{borderBottom:'1px solid #eee', padding:'4px 0'}}>
          <div>{n.message}</div>
          <div className="small muted">{new Date(n.created_at).toLocaleString()}</div>
          {!n.is_read && <button className="btn secondary" onClick={()=>markRead(n.id)}>Mark read</button>}
        </div>
      ))}
    </div>
  )
}
