import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { homePathForRole } from '../lib/roles'
import './Navbar.css'

/**
 * Public landing-page navigation bar.
 *
 * No props. Reads the current session from `useAuth` and swaps between the
 * logged-out view (Login / Start Demo) and the logged-in view (Dashboard / Sign Out)
 * so the same top bar works for visitors and returning users.
 */
export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handlePrimaryAction() {
    navigate(user ? homePathForRole(user.role) : '/auth')
  }

  function handleSignOut() {
    logout()
    navigate('/')
  }

  return (
    <nav className="home-nav">
      <button className="home-brand reset-button" onClick={() => navigate('/')} type="button">
        Campus Closet
      </button>

      <div className="home-nav-actions">
        {!user && (
          <>
            <button className="home-link reset-button" onClick={() => navigate('/auth')} type="button">
              Login
            </button>
            <button className="btn btn-light" onClick={handlePrimaryAction} type="button">
              Start Demo
            </button>
          </>
        )}

        {user && (
          <>
            <button className="home-link reset-button" onClick={handlePrimaryAction} type="button">
              Dashboard
            </button>
            <button className="btn btn-outline-light" onClick={handleSignOut} type="button">
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
