import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { homePathForRole } from '../lib/roles'
import '../pages/Dashboard.css'

/**
 * Shared navigation bar used across every authenticated page.
 *
 * Props:
 * - brand: optional brand label; defaults to 'Campus Closet'.
 * - items: array of nav entries. Each entry is either { label, to } for a route link
 *          or { label, onClick } for a handler (e.g. opening the cart sidebar).
 *          An optional `variant: 'primary'` flag styles the button as the main call to action.
 *
 * The brand text always routes the user back to their role home, and a Sign Out
 * action is appended automatically so every page shares the same exit behavior.
 */
export default function DashboardNav({ brand = 'Campus Closet', items = [] }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  function handleSignOut() {
    logout()
    navigate('/')
  }

  function handleItemClick(item) {
    if (item.onClick) {
      item.onClick()
      return
    }

    if (item.to) {
      navigate(item.to)
    }
  }

  return (
    <nav className="dash-navbar">
      <span
        className="dash-brand"
        onClick={() => navigate(homePathForRole(user.role))}
        style={{ cursor: 'pointer' }}
      >
        {brand}
      </span>

      <div className="dash-nav-actions">
        {items.map((item) => (
          <button
            className={`dash-icon-btn ${item.variant === 'primary' ? 'dash-icon-btn-primary' : ''}`}
            key={item.label}
            onClick={() => handleItemClick(item)}
            type="button"
          >
            {item.label}
          </button>
        ))}

        <span className="dash-user">{user.email}</span>
        <button className="dash-icon-btn signout" onClick={handleSignOut} type="button">
          Sign Out
        </button>
      </div>
    </nav>
  )
}
