import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/listings'
import './SellerDashboard.css'

export default function SellerDashboard() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [listings, setListings] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [listingData, orderData] = await Promise.all([
          apiRequest('/seller/listings', { token }),
          apiRequest('/seller/orders', { token }),
        ])

        setListings(listingData.listings)
        setOrderItems(orderData.items)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [token])

  async function changeStatus(listing, nextStatus) {
    setBusyId(listing.id)
    setError('')

    try {
      const data = await apiRequest(`/seller/listings/${listing.id}/status`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus },
      })

      setListings((current) => current.map((entry) => (entry.id === listing.id ? data.listing : entry)))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading seller tools..." />
  }

  const activeListings = listings.filter((listing) => listing.status === 'active').length
  const draftListings = listings.filter((listing) => listing.status === 'draft').length
  const soldListings = listings.filter((listing) => listing.status === 'sold').length
  const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.priceSnapshot) * Number(item.quantity), 0)

  return (
    <div className="seller-page">
      <DashboardNav
        items={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Shop', to: '/shop' },
          { label: 'Notifications', to: '/notifications' },
          { label: 'New Listing', to: '/seller/listings/new', variant: 'primary' },
        ]}
      />

      <div className="seller-content">
        <h1 className="seller-heading">Seller Dashboard</h1>

        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-value">{formatCurrency(totalRevenue)}</p>
            <p className="stat-label">Total Earned</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{activeListings}</p>
            <p className="stat-label">Active Listings</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{soldListings}</p>
            <p className="stat-label">Items Sold</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{draftListings}</p>
            <p className="stat-label">Draft Listings</p>
          </div>
        </div>

        {error && <p className="inline-error">{error}</p>}

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Your Listings</h2>
            <button className="btn-new" onClick={() => navigate('/seller/listings/new')} type="button">
              + New Listing
            </button>
          </div>

          {!!listings.length && (
            <div className="listings-table">
              <div className="table-header">
                <span>Listing</span>
                <span>Status</span>
                <span>Price</span>
                <span>Created</span>
                <span>Actions</span>
              </div>

              {listings.map((listing) => (
                <div className="table-row" key={listing.id}>
                  <div className="table-item-name">
                    {listing.imageUrl ? (
                      <img alt={listing.title || 'Listing'} className="table-img table-photo" src={listing.imageUrl} />
                    ) : (
                      <div className="table-img">{listing.school || 'Draft'}</div>
                    )}
                    <div>
                      <strong>{listing.title || 'Untitled Draft'}</strong>
                      <p className="row-subtitle">
                        {[listing.category, listing.size, listing.condition].filter(Boolean).join(' • ') || 'Draft in progress'}
                      </p>
                      {listing.adminReason && <p className="flag-reason">Admin note: {listing.adminReason}</p>}
                    </div>
                  </div>
                  <span className={`status-badge badge-${listing.status}`}>{listing.status}</span>
                  <span>{formatCurrency(listing.price)}</span>
                  <span>{formatDate(listing.createdAt)}</span>
                  <div className="table-actions">
                    {listing.status !== 'removed' && listing.status !== 'sold' && (
                      <button
                        className="action-btn"
                        onClick={() => navigate(`/seller/listings/${listing.id}/edit`)}
                        type="button"
                      >
                        Edit
                      </button>
                    )}
                    {listing.status === 'draft' && (
                      <button
                        className="action-btn"
                        disabled={busyId === listing.id}
                        onClick={() => changeStatus(listing, 'active')}
                        type="button"
                      >
                        Publish
                      </button>
                    )}
                    {listing.status !== 'sold' && listing.status !== 'draft' && listing.status !== 'removed' && (
                      <button
                        className="action-btn"
                        disabled={busyId === listing.id}
                        onClick={() => changeStatus(listing, listing.status === 'hidden' ? 'active' : 'hidden')}
                        type="button"
                      >
                        {listing.status === 'hidden' ? 'Restore' : 'Hide'}
                      </button>
                    )}
                    {listing.status !== 'sold' && listing.status !== 'draft' && listing.status !== 'removed' && (
                      <button
                        className="action-btn"
                        disabled={busyId === listing.id}
                        onClick={() => changeStatus(listing, 'sold')}
                        type="button"
                      >
                        Mark Sold
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!listings.length && (
            <div className="empty-state">
              <p>You do not have any listings yet.</p>
              <button className="btn-new" onClick={() => navigate('/seller/listings/new')} type="button">
                Create your first listing
              </button>
            </div>
          )}
        </section>

        <section className="section">
          <h2 className="section-title">Recent Orders</h2>

          {!!orderItems.length && (
            <div className="listings-table">
              <div className="table-header seller-orders-grid">
                <span>Order</span>
                <span>Buyer</span>
                <span>Item</span>
                <span>Qty</span>
                <span>Total</span>
              </div>

              {orderItems.map((item) => (
                <div className="table-row seller-orders-grid" key={item.id}>
                  <div>
                    <strong>#{item.orderId}</strong>
                    <p className="row-subtitle">{formatDate(item.createdAt)}</p>
                  </div>
                  <span>{item.buyer?.email}</span>
                  <span>{item.titleSnapshot}</span>
                  <span>{item.quantity}</span>
                  <span>{formatCurrency(item.priceSnapshot * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {!orderItems.length && (
            <div className="empty-state">
              <p>No orders have been placed yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
