import { useNavigate } from 'react-router-dom'
import './UserManagement.css'

export default function UserManagement() {
  const navigate = useNavigate()

  return (
    <div className="admin-page">

      <nav className="dash-navbar">
        <span className="dash-brand">Campus Closet — Admin</span>
        <div className="dash-nav-actions">
          <button className="dash-icon-btn" onClick={() => navigate('/admin')}>Dashboard</button>
          <button className="dash-icon-btn" onClick={() => navigate('/admin/moderation')}>Moderation</button>
          <button className="dash-icon-btn" onClick={() => navigate('/')}>Exit Admin</button>
        </div>
      </nav>

      <div className="admin-content">
        <h1 className="admin-heading">User Management</h1>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            className="user-search"
          />
        </div>

        <section className="section">
          <h2 className="section-title">All Users</h2>
          <div className="listings-table">
            <div className="table-header admin-users-grid">
              <span>Username</span>
              <span>Email</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="empty-state">
              <p>No users yet.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}