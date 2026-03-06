import './Home.css'
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <div style={{ position: 'relative' }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
    
        }}
      >
        <source src="/college3.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: -1,
      }} />

      <Navbar />
      <h1>Hello World</h1>
    </div>
  )
}