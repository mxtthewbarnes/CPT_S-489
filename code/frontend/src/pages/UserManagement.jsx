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
  const [actionDraft, setActionDraft] = useState(null)

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
      return data.user
    } catch (requestError) {
      setError(requestError.message)
      return null
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
    setError('')
    setActionDraft({
      id: user.id,
      email: user.email,
      status: 'suspended',
      reason: '',
      note: user.statusNote || '',
      durationDays: '7',
    })
  }

  async function banUser(user) {
    setError('')
    setActionDraft({
      id: user.id,
      email: user.email,
      status: 'banned',
      reason: '',
      note: user.statusNote || '',
      durationDays: '7',
    })
  }

  async function restoreUser(user) {
    const note = window.prompt(`Optional note for restoring ${user.email}:`, '') || ''
    await changeStatus(user.id, { status: 'active', note })
  }

  function updateActionDraft(event) {
    const { name, value } = event.target

    setActionDraft((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function cancelActionDraft() {
    setActionDraft(null)
    setError('')
  }

  async function submitAction(event) {
    event.preventDefault()

    const reason = actionDraft?.reason.trim() || ''

    if (!reason || !actionDraft) {
      setError(`${actionDraft?.status === 'suspended' ? 'Suspension' : 'Ban'} reason is required.`)
      return
    }

    const payload = {
      status: actionDraft.status,
      reason,
      note: actionDraft.note.trim(),
    }

    if (actionDraft.status === 'suspended') {
      const durationDays = Number(actionDraft.durationDays)

      if (![1, 7, 30].includes(durationDays)) {
        setError('Suspensions must be 1, 7, or 30 days.')
        return
      }

      payload.durationDays = durationDays
    }

    const updatedUser = await changeStatus(actionDraft.id, payload)

    if (updatedUser) {
      setActionDraft(null)
    }
  }

  const isSuspendDraft = actionDraft?.status === 'suspended'
  const actionLabel = isSuspendDraft ? 'Suspend' : 'Ban'
  const actionDescription = isSuspendDraft
    ? 'Add the required reason shown to the user, choose the suspension length, and include any optional internal note.'
    : 'Add the required reason shown to the user, plus an optional internal note for admin records.'

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

        {actionDraft && (
          <section
            className={`panel form-card admin-action-panel ${
              isSuspendDraft ? 'admin-action-panel-suspended' : 'admin-action-panel-banned'
            }`}
          >
            <div className="page-header admin-action-header">
              <div>
                <p className="eyebrow">Account Action</p>
                <h2 className="section-title">
                  {actionLabel} {actionDraft.email}
                </h2>
                <p className="muted-copy">{actionDescription}</p>
              </div>

              <button className="btn-view-all" onClick={cancelActionDraft} type="button">
                Cancel
              </button>
            </div>

            <form onSubmit={submitAction}>
              <div className="form-grid admin-action-grid">
                <label className="field-label">
                  Reason for {isSuspendDraft ? 'suspension' : 'ban'}
                  <textarea
                    className="field-input field-textarea admin-action-reason"
                    name="reason"
                    onChange={updateActionDraft}
                    placeholder={
                      isSuspendDraft
                        ? 'Explain why this account is being suspended.'
                        : 'Explain why this account is being banned.'
                    }
                    required
                    value={actionDraft.reason}
                  />
                </label>

                <label className="field-label">
                  Admin note
                  <textarea
                    className="field-input field-textarea admin-action-note"
                    name="note"
                    onChange={updateActionDraft}
                    placeholder="Optional note for the moderation team."
                    value={actionDraft.note}
                  />
                </label>

                {isSuspendDraft && (
                  <label className="field-label admin-action-duration">
                    Suspension length
                    <select
                      className="field-input"
                      name="durationDays"
                      onChange={updateActionDraft}
                      value={actionDraft.durationDays}
                    >
                      <option value="1">1 day</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </label>
                )}
              </div>

              <div className="form-actions">
                <button className="btn-view-all" onClick={cancelActionDraft} type="button">
                  Cancel
                </button>
                <button className="admin-action-submit" disabled={busyId === actionDraft.id} type="submit">
                  {busyId === actionDraft.id ? 'Saving...' : `${actionLabel} User`}
                </button>
              </div>
            </form>
          </section>
        )}

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
