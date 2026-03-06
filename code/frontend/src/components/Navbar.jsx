import { useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ onAuthClick }) {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <a className="navbar-brand" href="#">Campus Closet</a>
        <div className="navbar-nav ms-auto">
          <a className="nav-link" style={{ cursor: 'pointer' }} onClick={onAuthClick}>Login</a>
          <a className="btn btn-light ms-2" style={{ cursor: 'pointer' }} onClick={onAuthClick}>Register</a>
        </div>
      </div>
    </nav>
  )
}