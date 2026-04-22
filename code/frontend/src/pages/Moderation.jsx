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
  const [actionDraft, setActionDraft] = useState(null)

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
      return data.listing
    } catch (requestError) {
      setError(requestError.message)
      return null
    } finally {
      setBusyId(null)
    }
  }

  function restoreListing(listing) {
    setError('')
    setActionDraft({
      id: listing.id,
      title: listing.title,
      status: 'active',
      previousStatus: listing.status,
      sellerEmail: listing.seller?.email || 'Unknown seller',
      school: listing.school,
      price: listing.price,
      createdAt: listing.createdAt,
      adminReason: listing.adminReason || '',
      adminNote: listing.adminNote || '',
      hiddenByAccountStatus: Boolean(listing.hiddenByAccountStatus),
    })
  }

  function hideListing(listing) {
    setError('')
    setActionDraft({
      id: listing.id,
      title: listing.title,
      status: 'hidden',
      previousStatus: listing.status,
      sellerEmail: listing.seller?.email || 'Unknown seller',
      school: listing.school,
      price: listing.price,
      createdAt: listing.createdAt,
      reason: listing.adminReason || '',
      note: listing.adminNote || '',
      hiddenByAccountStatus: false,
    })
  }

  function removeListing(listing) {
    setError('')
    setActionDraft({
      id: listing.id,
      title: listing.title,
      status: 'removed',
      previousStatus: listing.status,
      sellerEmail: listing.seller?.email || 'Unknown seller',
      school: listing.school,
      price: listing.price,
      createdAt: listing.createdAt,
      reason: '',
      note: listing.adminNote || '',
      hiddenByAccountStatus: false,
    })
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

    if (!actionDraft) {
      return
    }

    const isRestoreDraft = actionDraft.status === 'active'

    if (isRestoreDraft && actionDraft.hiddenByAccountStatus) {
      return
    }

    const payload = {}

    if (!isRestoreDraft) {
      const reason = actionDraft.reason.trim()

      if (!reason) {
        setError(`${actionDraft.status === 'hidden' ? 'Hide' : 'Removal'} reason is required.`)
        return
      }

      payload.reason = reason
      payload.note = actionDraft.note.trim()
    }

    const updatedListing = await changeStatus(actionDraft.id, actionDraft.status, payload)

    if (updatedListing) {
      setActionDraft(null)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading moderation tools..." />
  }

  const isRestoreDraft = actionDraft?.status === 'active'
  const isHideDraft = actionDraft?.status === 'hidden'
  const restoreBlockedByAccountStatus = isRestoreDraft && Boolean(actionDraft?.hiddenByAccountStatus)
  const actionLabel = isRestoreDraft ? 'Restore' : isHideDraft ? 'Hide' : 'Remove'
  const actionDescription = isRestoreDraft
    ? restoreBlockedByAccountStatus
      ? 'This listing is hidden because the seller account is currently restricted. Restore the seller account first, then come back here to restore the listing.'
      : 'Review the current moderation details, then restore the listing to make it active in the marketplace again.'
    : isHideDraft
      ? 'Add the required reason shown to the seller, plus an optional internal note for moderation records.'
      : 'Add the required reason shown to the seller, plus an optional internal note for moderation records.'

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

        {actionDraft && (
          <section
            className={`panel form-card admin-action-panel ${
              isRestoreDraft
                ? 'admin-action-panel-restored'
                : isHideDraft
                  ? 'admin-action-panel-suspended'
                  : 'admin-action-panel-banned'
            }`}
          >
            <div className="page-header admin-action-header">
              <div>
                <p className="eyebrow">Listing Action</p>
                <h2 className="section-title">
                  {actionLabel} {actionDraft.title}
                </h2>
                <p className="muted-copy">{actionDescription}</p>
              </div>

              <button className="btn-view-all" onClick={cancelActionDraft} type="button">
                Cancel
              </button>
            </div>

            <form onSubmit={submitAction}>
              {isRestoreDraft ? (
                <div className="admin-restore-summary">
                  <div className="admin-restore-grid">
                    <article className="admin-restore-detail">
                      <span className="admin-restore-label">Current status</span>
                      <span className={`status-badge badge-${actionDraft.previousStatus}`}>{actionDraft.previousStatus}</span>
                    </article>

                    <article className="admin-restore-detail">
                      <span className="admin-restore-label">Seller</span>
                      <p className="admin-restore-copy">{actionDraft.sellerEmail}</p>
                    </article>

                    <article className="admin-restore-detail">
                      <span className="admin-restore-label">Listing details</span>
                      <p className="admin-restore-copy">
                        {actionDraft.school} • {formatCurrency(actionDraft.price)} • {formatDate(actionDraft.createdAt)}
                      </p>
                    </article>

                    <article className="admin-restore-detail">
                      <span className="admin-restore-label">Reason on file</span>
                      <p className="admin-restore-copy">{actionDraft.adminReason || 'No reason recorded.'}</p>
                    </article>

                    <article className="admin-restore-detail">
                      <span className="admin-restore-label">Admin note</span>
                      <p className="admin-restore-copy">{actionDraft.adminNote || 'No internal note recorded.'}</p>
                    </article>
                  </div>

                  <p className="muted-copy admin-restore-footnote">
                    Restoring this listing clears its moderation state and publishes it back to the marketplace.
                  </p>

                  {restoreBlockedByAccountStatus && (
                    <p className="admin-restore-warning">
                      This restore is blocked until the seller account is active again.
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-grid admin-action-grid">
                  <label className="field-label">
                    Reason for {isHideDraft ? 'hide' : 'removal'}
                    <textarea
                      className="field-input field-textarea admin-action-reason"
                      name="reason"
                      onChange={updateActionDraft}
                      placeholder={
                        isHideDraft
                          ? 'Explain why this listing is being hidden.'
                          : 'Explain why this listing is being removed.'
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
                </div>
              )}

              <div className="form-actions">
                <button className="btn-view-all" onClick={cancelActionDraft} type="button">
                  Cancel
                </button>
                <button
                  className="admin-action-submit"
                  disabled={busyId === actionDraft.id || restoreBlockedByAccountStatus}
                  type="submit"
                >
                  {busyId === actionDraft.id
                    ? 'Saving...'
                    : isRestoreDraft && restoreBlockedByAccountStatus
                      ? 'Seller Account Restricted'
                      : `${actionLabel} Listing`}
                </button>
              </div>
            </form>
          </section>
        )}

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
                          listing.status === 'hidden' || listing.status === 'removed'
                            ? restoreListing(listing)
                            : hideListing(listing)
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
