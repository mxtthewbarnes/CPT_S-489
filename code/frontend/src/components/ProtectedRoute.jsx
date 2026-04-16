import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { homePathForRole } from '../lib/roles'
import LoadingScreen from './LoadingScreen'

/**
 * Route guard for authenticated pages.
 *
 * Props:
 * - children: element rendered when the user is authenticated and role-allowed.
 * - roles: optional array of role strings ('buyer', 'seller', 'admin') allowed to view the page.
 *          Users with any other role are redirected to their default dashboard.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return children
}
