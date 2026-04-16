import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatDate } from '../lib/listings'
import './Dashboard.css'
import './SellerDashboard.css'

export default function Notifications() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await apiRequest('/notifications', { token })
        setNotifications(data.notifications)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [token])

  async function markRead(id) {
    try {
      const data = await apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
        token,
      })

      setNotifications((current) =>
        current.map((notification) => (notification.id === id ? data.notification : notification)),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function markAllRead() {
    try {
      const data = await apiRequest('/notifications/read-all', {
        method: 'PATCH',
        token,
      })
      setNotifications(data.notifications)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading notifications..." />
  }

  const navItems =
    user.role === 'admin'
      ? [
          { label: 'Admin', to: '/admin' },
          { label: 'Users', to: '/admin/users' },
          { label: 'Moderation', to: '/admin/moderation' },
        ]
      : [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Shop', to: '/shop' },
          { label: 'Orders', to: '/orders/history' },
          { label: 'University', to: '/university' },
        ]

  if (user.role === 'seller') {
    navItems.splice(1, 0, { label: 'Sell', to: '/seller' })
  }

  return (
    <div className="seller-page">
      <DashboardNav items={navItems} />

      <div className="seller-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Activity</p>
            <h1 className="seller-heading">Notifications</h1>
          </div>
          <button className="btn-view-all" onClick={markAllRead} type="button">
            Mark All Read
          </button>
        </div>

        {error && <p className="inline-error">{error}</p>}

        {!!notifications.length && (
          <div className="listings-table">
            <div className="table-header notifications-grid">
              <span>Notification</span>
              <span>Type</span>
              <span>Created</span>
              <span>Status</span>
            </div>

            {notifications.map((notification) => (
              <div className="table-row notifications-grid" key={notification.id}>
                <div>
                  <strong>{notification.title}</strong>
                  <p className="row-subtitle">{notification.message}</p>
                </div>
                <span>{notification.type}</span>
                <span>{formatDate(notification.createdAt)}</span>
                <div className="table-actions">
                  <span className={`status-badge ${notification.readAt ? 'badge-active' : 'badge-hidden'}`}>
                    {notification.readAt ? 'read' : 'new'}
                  </span>
                  {!!notification.link && (
                    <button className="action-btn" onClick={() => navigate(notification.link)} type="button">
                      Open
                    </button>
                  )}
                  {!notification.readAt && (
                    <button className="action-btn" onClick={() => markRead(notification.id)} type="button">
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!notifications.length && (
          <div className="empty-state">
            <p>You do not have any notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
