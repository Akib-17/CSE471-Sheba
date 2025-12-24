import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PremiumOffer() {
    const navigate = useNavigate()

    return (
        <div className="grid" style={{ maxWidth: 800, margin: '40px auto' }}>
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <h1 style={{ marginBottom: 20, color: 'var(--accent)' }}>✨ Go Premium ✨</h1>
                <p className="large muted" style={{ marginBottom: 40 }}>
                    Upgrade your experience and get exclusive benefits for just <strong>50 Taka/month</strong>.
                </p>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 40 }}>
                    <div className="card" style={{ boxShadow: 'none', border: '1px solid #eee' }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>⚡</div>
                        <h3>Priority Booking</h3>
                        <p className="small muted">Get your service requests matched with top-rated providers faster.</p>
                    </div>
                    <div className="card" style={{ boxShadow: 'none', border: '1px solid #eee' }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>🏷️</div>
                        <h3>Exclusive Discounts</h3>
                        <p className="small muted">Enjoy special discounts on service fees and partner offers.</p>
                    </div>
                    <div className="card" style={{ boxShadow: 'none', border: '1px solid #eee' }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>🏅</div>
                        <h3>Premium Badge</h3>
                        <p className="small muted">Stand out with a premium badge on your profile.</p>
                    </div>
                </div>

                <button
                    className="btn"
                    style={{ fontSize: '1.2rem', padding: '12px 32px' }}
                    onClick={() => navigate('/payment-gateway')}
                >
                    Buy Subscription - 50 Taka
                </button>
            </div>
        </div>
    )
}
