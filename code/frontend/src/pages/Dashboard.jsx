import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CartSidebar from '../components/CartSidebar'
import DashboardNav from '../components/DashboardNav'
import ListingCard from '../components/ListingCard'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency } from '../lib/listings'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)
  const [listings, setListings] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadListings() {
      try {
        const [listingData, wishlistData, sellerData] = await Promise.all([
          apiRequest('/listings', { token }),
          apiRequest('/wishlist', { token }),
          user.role === 'seller' ? apiRequest('/seller/listings', { token }) : Promise.resolve({ listings: [] }),
        ])

        setListings(listingData.listings)
        setWishlist(wishlistData.listings)
        setMyListings(sellerData.listings)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [token, user.role])

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />
  }

  const personalizedListings = user.university
    ? listings.filter((listing) => listing.school === user.university).slice(0, 6)
    : []
  const discoverListings = [...listings].sort((left, right) => {
    if (!user.university) {
      return 0
    }

    const leftMatches = left.school === user.university ? 1 : 0
    const rightMatches = right.school === user.university ? 1 : 0
    return rightMatches - leftMatches
  })
  const totalSchools = new Set(listings.map((listing) => listing.school)).size
  const averagePrice = listings.length
    ? listings.reduce((sum, listing) => sum + Number(listing.price), 0) / listings.length
    : 0
  const navItems = [
    { label: 'Home', to: '/dashboard' },
    { label: 'Shop', to: '/shop' },
    { label: 'Cart', onClick: () => setCartOpen(true) },
    { label: 'Orders', to: '/orders/history' },
    { label: 'University', to: '/university' },
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
        <section className="panel home-hero-panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">{user.role === 'seller' ? 'Marketplace home' : 'Buyer dashboard'}</p>
              <h1 className="section-title">Ready for the next campus find?</h1>
              <p className="muted-copy">
                {user.university
                  ? `Default school: ${user.university}`
                  : 'Choose a university to personalize your marketplace feed.'}
              </p>
            </div>
            <div className="dashboard-actions">
              <button className="btn-view-all" onClick={() => navigate('/university')} type="button">
                {user.university ? 'Change University' : 'Select University'}
              </button>
              <button className="btn-new" onClick={() => navigate('/shop')} type="button">
                Browse Listings
              </button>
            </div>
          </div>

          <div className="metric-grid compact-grid">
            <div className="metric-card">
              <p className="stat-value">{listings.length}</p>
              <p className="stat-label">Active Listings</p>
            </div>
            <div className="metric-card">
              <p className="stat-value">{wishlist.length}</p>
              <p className="stat-label">Liked Items</p>
            </div>
            <div className="metric-card">
              <p className="stat-value">{formatCurrency(averagePrice)}</p>
              <p className="stat-label">Average Price</p>
            </div>
            <div className="metric-card">
              <p className="stat-value">{totalSchools}</p>
              <p className="stat-label">Schools</p>
            </div>
          </div>

          {error && <p className="inline-error">{error}</p>}
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Your Listings</h2>
            {user.role === 'seller' && (
              <button className="btn-view-all" onClick={() => navigate('/seller')} type="button">
                Manage Inventory
              </button>
            )}
          </div>

          {!!myListings.length && (
            <div className="horizontal-scroll">
              {myListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() =>
                    navigate(
                      listing.status === 'draft' || listing.status === 'hidden'
                        ? `/seller/listings/${listing.id}/edit`
                        : `/product/${listing.id}`,
                    )
                  }
                />
              ))}
            </div>
          )}

          {!myListings.length && (
            <div className="empty-state">
              <p>
                {user.role === 'seller'
                  ? 'Your listings will appear here as soon as you start posting.'
                  : 'Seller accounts will see their own listings here.'}
              </p>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Liked Items</h2>
            <button className="btn-view-all" onClick={() => navigate('/shop')} type="button">
              Explore More
            </button>
          </div>

          {!!wishlist.length && (
            <div className="horizontal-scroll">
              {wishlist.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={() => navigate(`/product/${listing.id}`)} />
              ))}
            </div>
          )}

          {!wishlist.length && (
            <div className="empty-state">
              <p>Tap Like on a product page to save it here.</p>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Discover</h2>
            {user.university && !!personalizedListings.length && (
              <p className="muted-copy">Showing {user.university} items first.</p>
            )}
          </div>

          <div className="discover-grid">
            {discoverListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/product/${listing.id}`)}
              />
            ))}
          </div>

          {!discoverListings.length && (
            <div className="empty-state">
              <p>No active listings yet. Check back soon or sign in as a seller to post one.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
