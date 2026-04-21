import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/useAuth'
import { homePathForRole } from './lib/roles'
import AdminDashboard from './pages/AdminDashboard'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import ListingForm from './pages/ListingForm'
import Moderation from './pages/Moderation'
import NotFound from './pages/NotFound'
import Notifications from './pages/Notifications'
import OrderConfirmation from './pages/OrderConfirmation'
import PurchaseHistory from './pages/PurchaseHistory'
import ProductDetail from './pages/ProductDetail'
import SellerDashboard from './pages/SellerDashboard'
import Shop from './pages/Shop'
import UniversitySelection from './pages/UniversitySelection'
import UserManagement from './pages/UserManagement'

const APP_NAME = 'Campus Closet'
const DEFAULT_TITLE = `${APP_NAME} | Reclaimed College Gear`

function titleForPathname(pathname) {
  if (pathname === '/') return DEFAULT_TITLE
  if (pathname === '/auth') return `Sign In | ${APP_NAME}`
  if (pathname === '/dashboard') return `Dashboard | ${APP_NAME}`
  if (pathname === '/shop') return `Shop | ${APP_NAME}`
  if (pathname.startsWith('/product/')) return `Listing Details | ${APP_NAME}`
  if (pathname === '/orders/history') return `Purchase History | ${APP_NAME}`
  if (pathname.startsWith('/orders/') && pathname.endsWith('/confirmation')) return `Order Confirmation | ${APP_NAME}`
  if (pathname === '/university') return `Choose University | ${APP_NAME}`
  if (pathname === '/notifications') return `Notifications | ${APP_NAME}`
  if (pathname === '/seller') return `Seller Dashboard | ${APP_NAME}`
  if (pathname === '/seller/listings/new') return `New Listing | ${APP_NAME}`
  if (pathname.startsWith('/seller/listings/') && pathname.endsWith('/edit')) return `Edit Listing | ${APP_NAME}`
  if (pathname === '/admin') return `Admin Dashboard | ${APP_NAME}`
  if (pathname === '/admin/users') return `User Management | ${APP_NAME}`
  if (pathname === '/admin/moderation') return `Moderation | ${APP_NAME}`
  return APP_NAME
}

function RouteMetadata() {
  const location = useLocation()

  useEffect(() => {
    document.title = titleForPathname(location.pathname)
  }, [location.pathname])

  return null
}

function DashboardEntry() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate replace to="/auth" />
  }

  if (user.role === 'admin') {
    return <Navigate replace to={homePathForRole(user.role)} />
  }

  return <Dashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteMetadata />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['buyer', 'seller', 'admin']}>
              <DashboardEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute roles={['buyer', 'seller']}>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute roles={['buyer', 'seller']}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/history"
          element={
            <ProtectedRoute roles={['buyer', 'seller']}>
              <PurchaseHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id/confirmation"
          element={
            <ProtectedRoute roles={['buyer', 'seller']}>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university"
          element={
            <ProtectedRoute roles={['buyer', 'seller']}>
              <UniversitySelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={['buyer', 'seller', 'admin']}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller"
          element={
            <ProtectedRoute roles={['seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/listings/new"
          element={
            <ProtectedRoute roles={['seller']}>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/listings/:id/edit"
          element={
            <ProtectedRoute roles={['seller']}>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute roles={['admin']}>
              <Moderation />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
