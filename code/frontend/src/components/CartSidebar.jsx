import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency, getSchoolColor } from '../lib/listings'
import '../pages/Cart.css'

/**
 * Slide-in cart sidebar shared by every buyer page.
 *
 * Props:
 * - isOpen: boolean that controls the visibility transform and drives cart reloads.
 * - onClose: handler used to dismiss the sidebar and its overlay.
 *
 * The sidebar reloads the cart from `/api/cart` whenever it opens, and the checkout
 * button posts to `/api/orders/checkout`, closes the sidebar, and routes the user
 * to the order confirmation page for the newly created order.
 */
export default function CartSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyItemId, setBusyItemId] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCart() {
      if (!isOpen || !token) {
        return
      }

      setLoading(true)
      setError('')

      try {
        const data = await apiRequest('/cart', { token })
        setItems(data.items)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [isOpen, token])

  async function updateQuantity(itemId, quantity) {
    setBusyItemId(itemId)
    setError('')

    try {
      const data = await apiRequest(`/cart/${itemId}`, {
        method: 'PATCH',
        token,
        body: { quantity },
      })

      setItems(data.items)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyItemId(null)
    }
  }

  async function removeItem(itemId) {
    setBusyItemId(itemId)
    setError('')

    try {
      const data = await apiRequest(`/cart/${itemId}`, {
        method: 'DELETE',
        token,
      })

      setItems(data.items)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyItemId(null)
    }
  }

  async function checkout() {
    setCheckoutLoading(true)
    setError('')

    try {
      const data = await apiRequest('/orders/checkout', {
        method: 'POST',
        token,
      })

      onClose()
      navigate(`/orders/${data.order.id}/confirmation`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}

      <aside className={`cart-sidebar ${isOpen ? 'cart-open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <button className="cart-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="cart-items">
          {loading && <p className="muted-copy">Loading your cart...</p>}
          {!loading && !items.length && <p className="muted-copy">Your cart is empty.</p>}
          {error && <p className="inline-error">{error}</p>}

          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-img" style={{ background: getSchoolColor(item.listing.school) }}>
                <span>{item.listing.school}</span>
              </div>

              <div className="cart-item-info">
                <p className="cart-item-name">{item.listing.title}</p>
                <p className="cart-item-meta">
                  {item.listing.size} • {item.listing.condition}
                </p>
                <p className="cart-item-price">{formatCurrency(item.listing.price)}</p>

                <div className="cart-quantity">
                  <button
                    className="quantity-btn"
                    disabled={busyItemId === item.id || item.quantity === 1}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    disabled={busyItemId === item.id}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="cart-item-remove"
                disabled={busyItemId === item.id}
                onClick={() => removeItem(item.id)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <button
            className="btn-checkout"
            disabled={!items.length || checkoutLoading}
            onClick={checkout}
            type="button"
          >
            {checkoutLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </aside>
    </>
  )
}
