import { useState } from 'react'
import './Home.css'
import Navbar from '../components/Navbar'
import Auth from './Auth'

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <video
        autoPlay muted loop playsInline
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', zIndex: -1,
        }}
      >
        <source src="/college3.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.6)', zIndex: -1,
      }} />

      <Navbar onAuthClick={() => setShowAuth(true)} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', textAlign: 'center', color: 'white',
      }}>
        <p style={{ letterSpacing: '0.1em', marginBottom: '1rem' }}>Secondhand college apparel.</p>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', lineHeight: 1 }}>Campus<br/>Closet.</h1>
        <p style={{ letterSpacing: '0.2em', marginTop: '1rem' }}>BUY, SELL, AND REP YOUR SCHOOL.</p>
        <button className="btn btn-light mt-4">SHOP NOW</button>
      </div>

      {showAuth && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowAuth(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Auth />
          </div>
        </div>
      )}
    </div>
  )
}