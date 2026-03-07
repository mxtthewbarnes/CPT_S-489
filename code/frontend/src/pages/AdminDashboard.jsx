import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="admin-page">

      <nav className="dash-navbar">
        <span className="dash-brand">Campus Closet — Admin</span>
        <div className="dash-nav-actions">
          <button className="dash-icon-btn" onClick={() => navigate('/admin/users')}>User Management</button>
          <button className="dash-icon-btn" onClick={() => navigate('/admin/moderation')}>Moderation</button>
          <button className="dash-icon-btn" onClick={() => navigate('/')}>Exit Admin</button>
        </div>
      </nav>

      <div className="admin-content">

        <h1 className="admin-heading">Admin Dashboard</h1>

        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Active Listings</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Banned Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">0</p>
            <p className="stat-label">Flagged Items</p>
          </div>
        </div>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Users</h2>
            <button className="btn-view-all" onClick={() => navigate('/admin/users')}>View All</button>
          </div>
          <div className="empty-state">
            <p>No users yet.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Flagged Listings</h2>
            <button className="btn-view-all" onClick={() => navigate('/admin/moderation')}>View All</button>
          </div>
          <div className="empty-state">
            <p>No flagged listings.</p>
          </div>
        </section>

      </div>
    </div>
  )
}