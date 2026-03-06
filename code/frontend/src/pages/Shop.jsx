import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Shop.css'

const allItems = [
  { id: 1, school: 'WSU', name: 'Vintage Crewneck', price: 18, color: '#981e32' },
  { id: 2, school: 'UW', name: 'Game Day Hoodie', price: 24, color: '#33006F' },
  { id: 3, school: 'Michigan', name: 'Zip-Up Jacket', price: 30, color: '#00274C' },
  { id: 4, school: 'Ohio State', name: 'Quarter-Zip', price: 22, color: '#BB0000' },
  { id: 5, school: 'UCLA', name: 'Snap-back Cap', price: 12, color: '#2D68C4' },
  { id: 6, school: 'Penn State', name: 'Long Sleeve Tee', price: 15, color: '#1E407C' },
  { id: 7, school: 'Oregon', name: 'Pullover Hoodie', price: 28, color: '#154733' },
  { id: 8, school: 'Arizona', name: 'Varsity Jacket', price: 45, color: '#AB0520' },
  { id: 9, school: 'Boise State', name: 'Crewneck', price: 20, color: '#0033A0' },
  { id: 10, school: 'Utah', name: 'T-Shirt', price: 14, color: '#CC0000' },
  { id: 11, school: 'Colorado', name: 'Fleece Jacket', price: 35, color: '#CFB87C' },
  { id: 12, school: 'Stanford', name: 'Cap', price: 16, color: '#8C1515' },
  { id: 13, school: 'USC', name: 'Hoodie', price: 26, color: '#990000' },
  { id: 14, school: 'Cal', name: 'Long Sleeve', price: 19, color: '#003262' },
  { id: 15, school: 'Oregon State', name: 'Crewneck', price: 22, color: '#DC4405' },
  { id: 16, school: 'Notre Dame', name: 'Zip-Up', price: 32, color: '#0C2340' },
]

const schools = ['All', ...new Set(allItems.map(i => i.school))]

export default function Shop() {
  const [selectedSchool, setSelectedSchool] = useState('All')
  const navigate = useNavigate()

  const filtered = selectedSchool === 'All'
    ? allItems
    : allItems.filter(i => i.school === selectedSchool)

  return (
    <div className="shop-page">

      {/* Navbar */}
      <nav className="dash-navbar">
        <span className="dash-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Campus Closet</span>
        <div className="dash-nav-actions">
          <button className="dash-icon-btn" onClick={() => navigate('/dashboard')}>Home</button>
          <button className="dash-icon-btn" onClick={() => setCartOpen(true)}>Cart</button>
          <button className="dash-icon-btn">Profile</button>
        </div>
      </nav>

      <div className="shop-content">

        {/* Filter Bar */}
        <div className="filter-bar">
          <span className="filter-label">Filter by School:</span>
          <div className="filter-chips">
            {schools.map(school => (
              <button
                key={school}
                className={`chip ${selectedSchool === school ? 'chip-active' : ''}`}
                onClick={() => setSelectedSchool(school)}
              >
                {school}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="shop-grid">
          {filtered.map(item => (
            <div className="item-card" key={item.id} onClick={() => navigate(`/product/${item.id}`)}>
              <div className="item-img" style={{ background: item.color }}>
                <span className="item-school">{item.school}</span>
              </div>
              <div className="item-info">
                <p className="item-name">{item.name}</p>
                <p className="item-price">${item.price}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}