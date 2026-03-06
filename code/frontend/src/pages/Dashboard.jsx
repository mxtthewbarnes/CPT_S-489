import { useState } from 'react'
import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import CartSidebar from '../pages/Cart'

const yourListings = [
  { id: 1, school: 'WSU', name: 'Crimson Hoodie', price: '$22', color: '#981e32' },
  { id: 2, school: 'UW', name: 'Purple Crewneck', price: '$18', color: '#33006F' },
  { id: 3, school: 'Oregon', name: 'Green Jacket', price: '$35', color: '#154733' },
]

const likedItems = [
  { id: 1, school: 'WSU', name: 'Vintage Crewneck', price: '$18', color: '#981e32' },
  { id: 2, school: 'UW', name: 'Game Day Hoodie', price: '$24', color: '#33006F' },
  { id: 3, school: 'Michigan', name: 'Zip-Up Jacket', price: '$30', color: '#00274C' },
  { id: 4, school: 'Ohio State', name: 'Quarter-Zip', price: '$22', color: '#BB0000' },
  { id: 5, school: 'UCLA', name: 'Snap-back Cap', price: '$12', color: '#2D68C4' },
  { id: 6, school: 'Penn State', name: 'Long Sleeve Tee', price: '$15', color: '#1E407C' },
]

const discoverItems = [
  { id: 1, school: 'Oregon', name: 'Pullover Hoodie', price: '$28', color: '#154733' },
  { id: 2, school: 'Arizona', name: 'Varsity Jacket', price: '$45', color: '#AB0520' },
  { id: 3, school: 'Boise State', name: 'Crewneck', price: '$20', color: '#0033A0' },
  { id: 4, school: 'Utah', name: 'T-Shirt', price: '$14', color: '#CC0000' },
  { id: 5, school: 'Colorado', name: 'Fleece Jacket', price: '$35', color: '#CFB87C' },
  { id: 6, school: 'Stanford', name: 'Cap', price: '$16', color: '#8C1515' },
  { id: 7, school: 'USC', name: 'Hoodie', price: '$26', color: '#990000' },
  { id: 8, school: 'Cal', name: 'Long Sleeve', price: '$19', color: '#003262' },
  { id: 9, school: 'Oregon State', name: 'Crewneck', price: '$22', color: '#DC4405' },
  { id: 10, school: 'Washington State', name: 'Beanie', price: '$11', color: '#981e32' },
  { id: 11, school: 'Notre Dame', name: 'Zip-Up', price: '$32', color: '#0C2340' },
  { id: 12, school: 'Michigan State', name: 'Pullover', price: '$24', color: '#18453B' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="dashboard">

      <nav className="dash-navbar">
        <span className="dash-brand">Campus Closet</span>
        <div className="dash-nav-actions">
          <button className="dash-icon-btn" onClick={() => navigate('/shop')}>Shop</button>
          <button className="dash-icon-btn" onClick={() => setCartOpen(true)}>Cart</button>
          <button className="dash-icon-btn">Profile</button>
          <button className="dash-icon-btn signout" onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="dashboard-content">

        <section className="section">
          <h2 className="section-title">Your Listings</h2>
          <div className="horizontal-scroll">
            {yourListings.map(item => (
              <div className="item-card" key={item.id} onClick={() => navigate(`/product/${item.id}`)}>
                <div className="item-img" style={{ background: item.color }}>
                  <span className="item-school">{item.school}</span>
                </div>
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Liked Items</h2>
          <div className="horizontal-scroll">
            {likedItems.map(item => (
              <div className="item-card" key={item.id} onClick={() => navigate(`/product/${item.id}`)}>
                <div className="item-img" style={{ background: item.color }}>
                  <span className="item-school">{item.school}</span>
                </div>
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Discover</h2>
          <div className="discover-grid">
            {discoverItems.map(item => (
              <div className="item-card" key={item.id} onClick={() => navigate(`/product/${item.id}`)}>
                <div className="item-img" style={{ background: item.color }}>
                  <span className="item-school">{item.school}</span>
                </div>
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}