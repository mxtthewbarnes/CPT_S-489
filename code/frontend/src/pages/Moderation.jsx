import { useEffect, useState } from 'react'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/listings'
import './AdminDashboard.css'
import './UserManagement.css'

export default function Moderation() {
  const { token } = useAuth()
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await apiRequest('/admin/listings', { token })
        setListings(data.listings)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [token])

  const filteredListings = listings.filter((listing) => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return true
    }

    return [listing.title, listing.school, listing.seller?.email, listing.status, listing.adminReason, listing.adminNote]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery))
  })

  async function changeStatus(listingId, nextStatus, options = {}) {
    setBusyId(listingId)
    setError('')

    try {
      const data = await apiRequest(`/admin/listings/${listingId}/status`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus, ...options },
      })

      setListings((current) =>
        current.map((listing) => (listing.id === listingId ? data.listing : listing)),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function removeListing(listing) {
    const reason = window.prompt(`Reason for removing "${listing.title}"?`)

    if (!reason) {
      return
    }

    const note = window.prompt('Optional moderation note:', listing.adminNote || '') || ''
    await changeStatus(listing.id, 'removed', { reason, note })
  }

  if (loading) {
    return <LoadingScreen message="Loading moderation tools..." />
  }

  return (
    <div className="admin-page">
      <DashboardNav
        brand="Campus Closet — Admin"
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'User Management', to: '/admin/users' },
        ]}
      />

      <div className="admin-content">
        <h1 className="admin-heading">Listing Moderation</h1>

        <div className="search-bar">
          <input
            className="user-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, school, seller, or status..."
            type="text"
            value={query}
          />
        </div>

        {error && <p className="inline-error">{error}</p>}

        <section className="section">
          <h2 className="section-title">All Listings</h2>
          <div className="listings-table">
            <div className="table-header admin-flags-grid admin-flags-grid-wide">
              <span>Listing</span>
              <span>Seller</span>
              <span>Status</span>
              <span>Notes</span>
              <span>Actions</span>
            </div>

            {filteredListings.map((listing) => (
              <div className="table-row admin-flags-grid admin-flags-grid-wide" key={listing.id}>
                <div>
                  <strong>{listing.title}</strong>
                  <p className="row-subtitle">
                    {listing.school} • {formatCurrency(listing.price)} • {formatDate(listing.createdAt)}
                  </p>
                </div>
                <span>{listing.seller?.email}</span>
                <span className={`status-badge badge-${listing.status}`}>{listing.status}</span>
                <div>
                  <span>{listing.adminReason || 'No admin note'}</span>
                  {listing.adminNote && <p className="row-subtitle">{listing.adminNote}</p>}
                </div>
                <div className="table-actions">
                  {listing.status !== 'sold' && (
                    <>
                      <button
                        className="action-btn"
                        disabled={busyId === listing.id}
                        onClick={() =>
                          changeStatus(listing.id, listing.status === 'hidden' || listing.status === 'removed' ? 'active' : 'hidden')
                        }
                        type="button"
                      >
                        {listing.status === 'hidden' || listing.status === 'removed' ? 'Restore' : 'Hide'}
                      </button>
                      {listing.status !== 'removed' && (
                        <button
                          className="action-btn"
                          disabled={busyId === listing.id}
                          onClick={() => removeListing(listing)}
                          type="button"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {!filteredListings.length && (
              <div className="empty-state">
                <p>No listings matched your search.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
