import { useEffect, useState } from 'react'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/listings'
import './AdminDashboard.css'
import './UserManagement.css'

export default function UserManagement() {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await apiRequest('/admin/users', { token })
        setUsers(data.users)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [token])

  async function changeStatus(userId, payload) {
    setBusyId(userId)
    setError('')

    try {
      const data = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        token,
        body: payload,
      })

      setUsers((current) => current.map((user) => (user.id === userId ? data.user : user)))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading users..." />
  }

  const filteredUsers = users.filter((user) => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return true
    }

    return `${user.email} ${user.role} ${user.status} ${user.statusReason || ''} ${user.university || ''}`
      .toLowerCase()
      .includes(normalizedQuery)
  })

  async function suspendUser(user) {
    const reason = window.prompt(`Reason for suspending ${user.email}?`)

    if (!reason) {
      return
    }

    const durationDays = Number(window.prompt('Suspend for how many days? Enter 1, 7, or 30.', '7'))

    if (![1, 7, 30].includes(durationDays)) {
      setError('Suspensions must be 1, 7, or 30 days.')
      return
    }

    const note = window.prompt('Optional admin note:', user.statusNote || '') || ''
    await changeStatus(user.id, { status: 'suspended', reason, note, durationDays })
  }

  async function banUser(user) {
    const reason = window.prompt(`Reason for banning ${user.email}?`)

    if (!reason) {
      return
    }

    const note = window.prompt('Optional admin note:', user.statusNote || '') || ''
    await changeStatus(user.id, { status: 'banned', reason, note })
  }

  async function restoreUser(user) {
    const note = window.prompt(`Optional note for restoring ${user.email}:`, '') || ''
    await changeStatus(user.id, { status: 'active', note })
  }

  return (
    <div className="admin-page">
      <DashboardNav
        brand="Campus Closet — Admin"
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Moderation', to: '/admin/moderation' },
        ]}
      />

      <div className="admin-content">
        <h1 className="admin-heading">User Management</h1>

        <div className="search-bar">
          <input
            className="user-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users..."
            type="text"
            value={query}
          />
        </div>

        {error && <p className="inline-error">{error}</p>}

        <section className="section">
          <h2 className="section-title">All Users</h2>
          <div className="listings-table">
            <div className="table-header admin-users-grid admin-users-grid-wide">
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Moderation</span>
              <span>Actions</span>
            </div>

            {filteredUsers.map((user) => (
              <div className="table-row admin-users-grid admin-users-grid-wide" key={user.id}>
                <div>
                  <span>{user.email}</span>
                  {user.university && <p className="row-subtitle">{user.university}</p>}
                </div>
                <span>{user.role}</span>
                <span>{formatDate(user.createdAt)}</span>
                <span className={`status-badge badge-${user.status}`}>{user.status}</span>
                <div>
                  <span>{user.statusReason || 'Good standing'}</span>
                  {user.suspensionEndsAt && <p className="row-subtitle">Ends {formatDate(user.suspensionEndsAt)}</p>}
                </div>
                <div className="table-actions">
                  {user.status !== 'active' ? (
                    <button
                      className="action-btn"
                      disabled={busyId === user.id || currentUser.id === user.id}
                      onClick={() => restoreUser(user)}
                      type="button"
                    >
                      Restore
                    </button>
                  ) : (
                    <>
                      <button
                        className="action-btn"
                        disabled={busyId === user.id || currentUser.id === user.id}
                        onClick={() => suspendUser(user)}
                        type="button"
                      >
                        Suspend
                      </button>
                      <button
                        className="action-btn"
                        disabled={busyId === user.id || currentUser.id === user.id}
                        onClick={() => banUser(user)}
                        type="button"
                      >
                        Ban
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {!filteredUsers.length && (
              <div className="empty-state">
                <p>No users matched your search.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
