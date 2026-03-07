import { useNavigate } from 'react-router-dom'
import './SellerDashboard.css'

export default function SellerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="seller-page">

      <nav className="dash-navbar">
        <span className="dash-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Campus Closet</span>
        <div className="dash-nav-actions">
          <button className="dash-icon-btn" onClick={() => navigate('/dashboard')}>Home</button>
          <button className="dash-icon-btn">Profile</button>
        </div>
      </nav>

      <div className="seller-content">

        <h1 className="seller-heading">Seller Dashboard</h1>

        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-value">$0</p>
            <p className="stat-label">Total Earned</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Active Listings</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Items Sold</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Total Views</p>
          </div>
        </div>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Your Listings</h2>
            <button className="btn-new" onClick={() => navigate('/create-listing')}>+ New Listing</button>
          </div>
          <div className="empty-state">
            <p>N/A</p>
            <button className="btn-new" onClick={() => navigate('/create-listing')}>Create your first listing</button>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Recent Orders</h2>
          <div className="empty-state">
            <p>N/A</p>
          </div>
        </section>

      </div>
    </div>
  )
}