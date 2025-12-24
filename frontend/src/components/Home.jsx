import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// Import images
import imgAc from '../image/1731928932_acservicing_270x180 (1).png'
import imgCleaning from '../image/1732001441_homecleaning_270x180.png'
import imgShifting from '../image/1732074706_houseshiftingservices_270x180.png'
import imgBarber from '../image/1732102178_haircutformen.jpg'
import imgPlumbing from '../image/1732508129_plumbingsanitaryservices_270x180.png'
import imgElectric from '../image/1732509630_electricalcheckup.png'
import imgSalon from '../image/1731990229_saloncare.png'
import logo from '../image/logo.png'

const SERVICES = [
  { id: 'ac repair', title: 'AC Repair', img: imgAc },
  { id: 'cleaner', title: 'Home Cleaning', img: imgCleaning },
  { id: 'shifting', title: 'House Shifting', img: imgShifting },
  { id: 'barber', title: 'Men\'s Salon', img: imgBarber },
  { id: 'plumber', title: 'Plumbing', img: imgPlumbing },
  { id: 'electrician', title: 'Electrician', img: imgElectric },
  { id: 'women salon care', title: 'Women\'s Salon', img: imgSalon },
]

const LOCATIONS = ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mirpur', 'Badda', 'Bashundhara']

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [searchLoc, setSearchLoc] = useState('')
  const [searchCat, setSearchCat] = useState('')
  const [showLocModal, setShowLocModal] = useState(false)
  const [pendingCategory, setPendingCategory] = useState(null)
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data.user)).catch(console.error)
  }, [])

  function handleServiceClick(category) {
    if (!user) {
      navigate('/login')
      return
    }
    // Check if user has location
    if (user.location) {
      navigate('/request', { state: { category } })
    } else {
      setPendingCategory(category)
      setShowLocModal(true)
    }
  }

  function handleSearch() {
    if (!searchCat) return
    handleServiceClick(searchCat)
  }

  async function saveLocation() {
    if (!newLocation) return
    try {
      await api.put('/profile', { location: newLocation })
      // Update local user state
      setUser({ ...user, location: newLocation })
      setShowLocModal(false)
      // Proceed to request
      if (pendingCategory) {
        navigate('/request', { state: { category: pendingCategory } })
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update location')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #EF3E5B 0%, #a82239 100%)',
        padding: '80px 20px',
        borderRadius: '0 0 24px 24px',
        marginBottom: 40,
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Logo Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.1,
          pointerEvents: 'none',
          backgroundImage: `url(${logo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          width: '600px',
          height: '400px'
        }} />

        <h1 style={{ color: 'white', marginBottom: 16, position: 'relative' }}>Your Personal Assistant</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: 40, position: 'relative' }}>One-stop solution for your services. Order any service, anytime.</p>

        {/* Search Panel */}
        <div style={{
          background: 'white',
          maxWidth: 800,
          margin: '0 auto',
          padding: 12,
          borderRadius: 16,
          display: 'flex',
          gap: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <select
              value={searchLoc}
              onChange={e => setSearchLoc(e.target.value)}
              style={{ border: 'none', background: '#F3F4F6', height: '100%' }}
            >
              <option value="">Select Location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <select
              value={searchCat}
              onChange={e => setSearchCat(e.target.value)}
              style={{ border: 'none', background: '#F3F4F6', height: '100%' }}
            >
              <option value="">What service do you need?</option>
              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <button className="btn" style={{ padding: '12px 32px' }} onClick={handleSearch}>Find</button>
        </div>
      </div>

      {/* Service Grid */}
      <div className="container">
        <h2 className="text-center" style={{ marginBottom: 40 }}>Our Services</h2>
        <div className="grid cols-4" style={{ gap: 24 }}>
          {SERVICES.map(service => (
            <div
              key={service.id}
              className="card"
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: 'none' }}
              onClick={() => handleServiceClick(service.id)}
            >
              <div style={{ height: 160, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {service.img ? (
                  <img src={service.img} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 40 }}>⚡</span>
                )}
              </div>
              <div style={{ padding: 16, textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 0 }}>{service.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div style={{ background: '#FFF0F3', padding: '60px 0', marginTop: 40 }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 800 }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: 20 }}>About Sheba</h2>
          <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.6 }}>
            Sheba is the #1 service marketplace in Bangladesh. We connect you with verified professionals for all your home service needs. From AC repair to home cleaning, shifting, and salon services - we ensure quality, safety, and transparency.
          </p>
        </div>
      </div>

      {/* Action Bar (Complaint & Helpline) */}
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          padding: 30, background: 'white', borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div>
            <h3 style={{ marginBottom: 8 }}>Have a concern?</h3>
            <button className="btn outline" onClick={() => navigate('/complaint')}>File a Complaint</button>
          </div>
          <div style={{ width: 1, height: 60, background: '#eee', margin: '0 20px' }}></div>
          <div>
            <h3 style={{ marginBottom: 8 }}>Need Help? Call Us</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>16516</div>
            <div className="small muted">Toll Free 24/7</div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container" style={{ marginBottom: 60 }}>
        <h2 className="text-center" style={{ marginBottom: 30 }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {[
            { q: "How do I book a service?", a: "Simply select your location and required service from the search bar or category list. Choose a provider and submit your request." },
            { q: "Are the professionals verified?", a: "Yes, all our service partners go through a strict verification process including NID and skill checks." },
            { q: "How do I pay?", a: "You can pay via cash on delivery or online payment methods after the service is completed." },
            { q: "What if something goes wrong?", a: "We have a dedicated support team. You can file a complaint directly from the website or call our helpline 16516." }
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 16, border: '1px solid #E5E7EB', borderRadius: 8, padding: 16, background: 'white' }}>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>{item.q}</div>
              <div style={{ color: '#666' }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Modal */}
      {showLocModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ marginTop: 0 }}>Set Your Location</h3>
            <p>Please tell us where you are located to find providers near you.</p>

            <div className="form-row">
              <label>Location</label>
              <select value={newLocation} onChange={e => setNewLocation(e.target.value)} autoFocus>
                <option value="">Select Area</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="flex justify-between" style={{ marginTop: 24 }}>
              <button className="btn secondary" onClick={() => setShowLocModal(false)}>Cancel</button>
              <button className="btn" onClick={saveLocation} disabled={!newLocation}>Save & Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
