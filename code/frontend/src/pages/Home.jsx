import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/useAuth'
import { homePathForRole } from '../lib/roles'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const primaryPath = user ? homePathForRole(user.role) : '/auth'

  return (
    <div className="home-page">
      <video autoPlay className="home-video" loop muted playsInline>
        <source src="/college3.mp4" type="video/mp4" />
      </video>

      <div className="home-overlay" />

      <Navbar />

      <main className="home-hero">
        <p className="home-tagline">Reclaimed college gear for loyal fans.</p>
        <h1 className="home-title">
          Campus
          <br />
          Closet
        </h1>
        <p className="home-subtitle">
          A React + Express + SQLite marketplace
        </p>

        <div className="home-cta-row">
          <button className="btn btn-light btn-lg" onClick={() => navigate(primaryPath)} type="button">
            {user ? 'Open Dashboard' : 'Launch Demo'}
          </button>
          <button className="btn btn-outline-light btn-lg" onClick={() => navigate('/auth')} type="button">
            View Login
          </button>
        </div>

        <div className="demo-grid">
          <div className="demo-card">
            <p className="demo-label">Buyer</p>
            <p>buyer@campuscloset.test</p>
            <p>password123</p>
          </div>
          <div className="demo-card">
            <p className="demo-label">Seller</p>
            <p>seller@campuscloset.test</p>
            <p>password123</p>
          </div>
          <div className="demo-card">
            <p className="demo-label">Admin</p>
            <p>admin@campuscloset.test</p>
            <p>password123</p>
          </div>
        </div>
      </main>
    </div>
  )
}
