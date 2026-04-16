import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CartSidebar from '../components/CartSidebar'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/listings'
import './Dashboard.css'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await apiRequest(`/orders/${id}`, { token })
        setOrder(data.order)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id, token])

  if (loading) {
    return <LoadingScreen message="Loading order confirmation..." />
  }

  const navItems = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Shop', to: '/shop' },
    { label: 'Cart', onClick: () => setCartOpen(true) },
    { label: 'Orders', to: '/orders/history' },
    { label: 'Notifications', to: '/notifications' },
  ]

  if (user.role === 'seller') {
    navItems.splice(2, 0, { label: 'Sell', to: '/seller' })
  }

  return (
    <div className="dashboard">
      <DashboardNav items={navItems} />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="dashboard-content">
        <div className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Order placed</p>
              <h1 className="section-title">Order Confirmation</h1>
            </div>
            {order && <span className="status-badge badge-placed">#{order.id}</span>}
          </div>

          {error && <p className="inline-error">{error}</p>}

          {order && (
            <>
              <div className="metric-grid compact-grid">
                <div className="metric-card">
                  <p className="stat-value">{formatCurrency(order.total)}</p>
                  <p className="stat-label">Order Total</p>
                </div>
                <div className="metric-card">
                  <p className="stat-value">{order.items.length}</p>
                  <p className="stat-label">Items</p>
                </div>
                <div className="metric-card">
                  <p className="stat-value">{formatDate(order.createdAt)}</p>
                  <p className="stat-label">Placed On</p>
                </div>
              </div>

              <div className="listings-table">
                <div className="table-header order-grid">
                  <span>Item</span>
                  <span>Seller</span>
                  <span>Quantity</span>
                  <span>Price</span>
                </div>

                {order.items.map((item) => (
                  <div className="table-row order-grid" key={item.id}>
                    <span>{item.titleSnapshot}</span>
                    <span>{item.seller?.email}</span>
                    <span>{item.quantity}</span>
                    <span>{formatCurrency(item.priceSnapshot)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
