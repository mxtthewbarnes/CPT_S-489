import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/listings'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userData, listingData] = await Promise.all([
          apiRequest('/admin/users', { token }),
          apiRequest('/admin/listings', { token }),
        ])

        setUsers(userData.users)
        setListings(listingData.listings)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [token])

  if (loading) {
    return <LoadingScreen message="Loading admin overview..." />
  }

  const bannedUsers = users.filter((user) => user.status === 'banned').length
  const suspendedUsers = users.filter((user) => user.status === 'suspended').length
  const hiddenListings = listings.filter((listing) => listing.status === 'hidden' || listing.status === 'removed').length
  const activeListings = listings.filter((listing) => listing.status === 'active').length

  return (
    <div className="admin-page">
      <DashboardNav
        brand="Campus Closet — Admin"
        items={[
          { label: 'User Management', to: '/admin/users' },
          { label: 'Moderation', to: '/admin/moderation' },
          { label: 'Notifications', to: '/notifications' },
        ]}
      />

      <div className="admin-content">
        <h1 className="admin-heading">Admin Dashboard</h1>

        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-value">{users.length}</p>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{activeListings}</p>
            <p className="stat-label">Active Listings</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{bannedUsers + suspendedUsers}</p>
            <p className="stat-label">Restricted Users</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{hiddenListings}</p>
            <p className="stat-label">Flagged Items</p>
          </div>
        </div>

        {error && <p className="inline-error">{error}</p>}

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Users</h2>
            <button className="btn-view-all" onClick={() => navigate('/admin/users')} type="button">
              View All
            </button>
          </div>

          <div className="listings-table">
            <div className="table-header admin-users-grid">
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Record</span>
            </div>

            {users.slice(0, 5).map((user) => (
              <div className="table-row admin-users-grid" key={user.id}>
                <span>{user.email}</span>
                <span>{user.role}</span>
                <span>{formatDate(user.createdAt)}</span>
                <span className={`status-badge badge-${user.status}`}>{user.status}</span>
                <span>{user.id}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Moderated Listings</h2>
            <button className="btn-view-all" onClick={() => navigate('/admin/moderation')} type="button">
              View All
            </button>
          </div>

          <div className="listings-table">
            <div className="table-header admin-flags-grid">
              <span>Listing</span>
              <span>Seller</span>
              <span>Status</span>
              <span>School</span>
            </div>

            {listings
              .filter((listing) => listing.status !== 'active')
              .slice(0, 5)
              .map((listing) => (
                <div className="table-row admin-flags-grid" key={listing.id}>
                  <span>{listing.title}</span>
                  <span>{listing.seller?.email}</span>
                  <span className={`status-badge badge-${listing.status}`}>{listing.status}</span>
                  <span>{listing.school}</span>
                </div>
              ))}

            {!listings.some((listing) => listing.status !== 'active') && (
              <div className="empty-state">
                <p>No moderated listings yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
