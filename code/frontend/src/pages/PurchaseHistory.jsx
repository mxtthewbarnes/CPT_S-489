import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/listings'
import './Dashboard.css'
import './SellerDashboard.css'

export default function PurchaseHistory() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiRequest('/orders/mine', { token })
        setOrders(data.orders)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [token])

  if (loading) {
    return <LoadingScreen message="Loading your purchase history..." />
  }

  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Shop', to: '/shop' },
    { label: 'University', to: '/university' },
    { label: 'Notifications', to: '/notifications' },
  ]

  if (user.role === 'seller') {
    navItems.splice(2, 0, { label: 'Sell', to: '/seller' })
  }

  return (
    <div className="seller-page">
      <DashboardNav items={navItems} />

      <div className="seller-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Orders</p>
            <h1 className="seller-heading">Purchase History</h1>
          </div>
          <button className="btn-new" onClick={() => navigate('/shop')} type="button">
            Browse Listings
          </button>
        </div>

        {error && <p className="inline-error">{error}</p>}

        {!!orders.length && (
          <div className="listings-table">
            <div className="table-header purchase-history-grid">
              <span>Order</span>
              <span>Date</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
            </div>

            {orders.map((order) => (
              <div className="table-row purchase-history-grid" key={order.id}>
                <div>
                  <strong>#{order.id}</strong>
                  <p className="row-subtitle">
                    {order.items.map((item) => item.titleSnapshot).join(', ') || 'No items'}
                  </p>
                </div>
                <span>{formatDate(order.createdAt)}</span>
                <span>{order.items.length}</span>
                <span>{formatCurrency(order.total)}</span>
                <div className="table-actions">
                  <span className={`status-badge badge-${order.status}`}>{order.status}</span>
                  <button
                    className="action-btn"
                    onClick={() => navigate(`/orders/${order.id}/confirmation`)}
                    type="button"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!orders.length && (
          <div className="empty-state">
            <p>You have not made any purchases yet.</p>
            <button className="btn-new" onClick={() => navigate('/shop')} type="button">
              Browse Listings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
