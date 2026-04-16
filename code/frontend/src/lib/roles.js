export function homePathForRole(role) {
  if (role === 'seller') {
    return '/seller'
  }

  if (role === 'admin') {
    return '/admin'
  }

  return '/dashboard'
}
