import './Cart.css'

const cartItems = [
  { id: 1, school: 'WSU', name: 'Vintage Crewneck', price: 18, color: '#981e32', size: 'L' },
  { id: 2, school: 'UW', name: 'Game Day Hoodie', price: 24, color: '#33006F', size: 'M' },
  { id: 3, school: 'Ohio State', name: 'Quarter-Zip', price: 22, color: '#BB0000', size: 'XL' },
]

export default function CartSidebar({ isOpen, onClose }) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="cart-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`cart-sidebar ${isOpen ? 'cart-open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {cartItems.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-img" style={{ background: item.color }}>
                <span>{item.school}</span>
              </div>
              <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-meta">Size: {item.size}</p>
                <p className="cart-item-price">${item.price}</p>
              </div>
              <button className="cart-item-remove">✕</button>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span>${total}</span>
          </div>
          <button className="btn-checkout">Checkout</button>
        </div>
      </div>
    </>
  )
}