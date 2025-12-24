import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function PaymentGateway() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handlePayment(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Simulate network delay for payment processing
        setTimeout(async () => {
            try {
                await api.post('/subscribe')
                // Payment successful
                navigate('/profile')
            } catch (err) {
                console.error('Payment error:', err)
                setError('Payment processing failed. Please try again.')
                setLoading(false)
            }
        }, 2000)
    }

    return (
        <div style={{ maxWidth: 500, margin: '40px auto' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Secure Payment</h2>

                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Premium Subscription (1 Month)</span>
                    <strong>50 ৳</strong>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="form-row">
                        <label>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" required />
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div className="form-row" style={{ flex: 1 }}>
                            <label>Expiry Date</label>
                            <input type="text" placeholder="MM/YY" required />
                        </div>
                        <div className="form-row" style={{ flex: 1 }}>
                            <label>CVV</label>
                            <input type="text" placeholder="123" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <label>Cardholder Name</label>
                        <input type="text" placeholder="John Doe" required />
                    </div>

                    {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}

                    <button className="btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Pay 50 Taka'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem' }}>
                    <span className="muted">Protected by 256-bit SSL encryption.</span>
                </div>
            </div>
        </div>
    )
}
