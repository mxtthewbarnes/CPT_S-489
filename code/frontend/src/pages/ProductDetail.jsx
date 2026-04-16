import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CartSidebar from '../components/CartSidebar'
import DashboardNav from '../components/DashboardNav'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDate, getSchoolColor } from '../lib/listings'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadListing() {
      try {
        const [listingData, wishlistData] = await Promise.all([
          apiRequest(`/listings/${id}`, { token }),
          apiRequest('/wishlist', { token }),
        ])

        setListing(listingData.listing)
        setIsLiked(wishlistData.listings.some((entry) => String(entry.id) === String(id)))
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadListing()
  }, [id, token])

  async function addToCart() {
    if (!listing) {
      return
    }

    setMessage('')
    setError('')

    try {
      await apiRequest('/cart', {
        method: 'POST',
        token,
        body: { listingId: listing.id, quantity: 1 },
      })

      setMessage('Added to cart.')
      setCartOpen(true)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function toggleWishlist() {
    if (!listing) {
      return
    }

    setMessage('')
    setError('')

    try {
      if (isLiked) {
        await apiRequest(`/wishlist/${listing.id}`, {
          method: 'DELETE',
          token,
        })
        setIsLiked(false)
        setMessage('Removed from liked items.')
      } else {
        await apiRequest('/wishlist', {
          method: 'POST',
          token,
          body: { listingId: listing.id },
        })
        setIsLiked(true)
        setMessage('Saved to liked items.')
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading listing details..." />
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
    <div className="detail-page">
      <DashboardNav items={navItems} />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="detail-content">
        <button className="back-btn" onClick={() => navigate('/shop')} type="button">
          ← Back to Shop
        </button>

        <div className="detail-layout">
          {listing?.imageUrl ? (
            <img alt={listing.title || 'Campus Closet listing'} className="detail-img detail-img-photo" src={listing.imageUrl} />
          ) : (
            <div className="detail-img" style={{ background: listing ? getSchoolColor(listing.school) : '#444' }}>
              <span className="detail-school">{listing?.school || 'N/A'}</span>
            </div>
          )}

          <div className="detail-info">
            {error && <p className="inline-error">{error}</p>}

            {listing && (
              <>
                <p className="detail-school-tag">{listing.school}</p>
                <h1 className="detail-name">{listing.title}</h1>
                <p className="detail-price">{formatCurrency(listing.price)}</p>

                <div className="detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value">{listing.category || 'Apparel'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Size</span>
                    <span className="meta-value">{listing.size}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Condition</span>
                    <span className="meta-value">{listing.condition}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Seller</span>
                    <span className="meta-value">{listing.seller?.email}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Posted</span>
                    <span className="meta-value">{formatDate(listing.createdAt)}</span>
                  </div>
                </div>

                <p className="detail-description">{listing.description}</p>
                {message && <p className="inline-success">{message}</p>}

                <div className="detail-actions">
                  <button className="btn-add-cart" onClick={addToCart} type="button">
                    Add to Cart
                  </button>
                  <button className="btn-like" onClick={toggleWishlist} type="button">
                    {isLiked ? 'Unlike' : 'Like'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
