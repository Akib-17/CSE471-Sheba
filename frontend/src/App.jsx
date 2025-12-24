import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProfilePage from './components/ProfilePage'
import Home from './components/Home'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Header from './components/Header'
import RequestPage from './components/RequestPage'
import ProviderDashboard from './components/ProviderDashboard'
import UserDashboard from './components/UserDashboard'
import ComplaintPage from './components/ComplaintPage'
import AdminDashboard from './components/AdminDashboard'
import PremiumOffer from './components/PremiumOffer'
import PaymentGateway from './components/PaymentGateway'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/complaint" element={<ComplaintPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/premium-offer" element={<PremiumOffer />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
