import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

const recentUsers = [
  { id: 1, name: 'cougfan99', email: 'coug@wsu.edu', joined: 'Mar 1, 2026', status: 'Active' },
  { id: 2, name: 'duckfan22', email: 'duck@oregon.edu', joined: 'Mar 2, 2026', status: 'Active' },
  { id: 3, name: 'trojanseller', email: 'trojan@usc.edu', joined: 'Mar 3, 2026', status: 'Banned' },
]

const flaggedListings = [
  { id: 1, school: 'WSU', name: 'Crimson Hoodie', seller: 'cougfan99', reason: 'Incorrect pricing' },
  { id: 2, school: 'USC', name: 'Vintage Tee', seller: 'trojanseller', reason: 'Prohibited item' },
]

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

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-value">128</p>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">54</p>
            <p className="stat-label">Active Listings</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">3</p>
            <p className="stat-label">Banned Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">2</p>
            <p className="stat-label">Flagged Items</p>
          </div>
        </div>

        {/* Recent Users */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Users</h2>
            <button className="btn-view-all" onClick={() => navigate('/admin/users')}>View All</button>
          </div>
          <div className="listings-table">
            <div className="table-header admin-users-grid">
              <span>Username</span>
              <span>Email</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {recentUsers.map(user => (
              <div className="table-row admin-users-grid" key={user.id}>
                <span>@{user.name}</span>
                <span>{user.email}</span>
                <span>{user.joined}</span>
                <span className={`status-badge ${user.status === 'Banned' ? 'badge-banned' : 'badge-active'}`}>
                  {user.status}
                </span>
                <div className="table-actions">
                  <button className="action-btn">View</button>
                  <button className="action-btn action-delete">
                    {user.status === 'Banned' ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flagged Listings */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Flagged Listings</h2>
            <button className="btn-view-all" onClick={() => navigate('/admin/moderation')}>View All</button>
          </div>
          <div className="listings-table">
            <div className="table-header admin-flags-grid">
              <span>Item</span>
              <span>Seller</span>
              <span>Reason</span>
              <span>Actions</span>
            </div>
            {flaggedListings.map(item => (
              <div className="table-row admin-flags-grid" key={item.id}>
                <div className="table-item-name">
                  <span>{item.name}</span>
                </div>
                <span>@{item.seller}</span>
                <span className="flag-reason">{item.reason}</span>
                <div className="table-actions">
                  <button className="action-btn">Approve</button>
                  <button className="action-btn action-delete">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}