import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CartSidebar from '../components/CartSidebar'
import DashboardNav from '../components/DashboardNav'
import ListingCard from '../components/ListingCard'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import './Shop.css'

export default function Shop() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [selectedSchool, setSelectedSchool] = useState('All')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await apiRequest('/listings', { token })
        setListings(data.listings)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [token])

  useEffect(() => {
    if (user?.university) {
      setSelectedSchool(user.university)
    }
  }, [user?.university])

  if (loading) {
    return <LoadingScreen message="Loading the marketplace..." />
  }

  const schools = ['All', ...new Set(listings.map((listing) => listing.school))]
  const filtered = listings.filter((listing) => {
    const schoolMatches = selectedSchool === 'All' || listing.school === selectedSchool
    const searchMatches =
      !search.trim() ||
      `${listing.title} ${listing.school} ${listing.size} ${listing.condition}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())

    return schoolMatches && searchMatches
  })

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
    <div className="shop-page">
      <DashboardNav items={navItems} />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="shop-content">
        <div className="filter-bar">
          <input
            className="shop-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, school, size, or condition..."
            type="text"
            value={search}
          />

          <div className="filter-chips">
            {schools.map((school) => (
              <button
                className={`chip ${selectedSchool === school ? 'chip-active' : ''}`}
                key={school}
                onClick={() => setSelectedSchool(school)}
                type="button"
              >
                {school}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="inline-error">{error}</p>}

        <div className="shop-grid">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => navigate(`/product/${listing.id}`)}
            />
          ))}
        </div>

        {!filtered.length && (
          <div className="empty-state">
            <p>No listings matched that filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
