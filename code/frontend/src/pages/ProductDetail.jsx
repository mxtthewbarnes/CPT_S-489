import { useNavigate } from 'react-router-dom'
import './ProductDetail.css'

export default function ProductDetail() {
  const navigate = useNavigate()

  // dummy product data - will be replaced with real data later
  const product = {
    school: 'WSU',
    name: 'Vintage Crewneck',
    price: 18,
    color: '#981e32',
    size: 'L',
    condition: 'Good',
    description: 'Classic WSU crewneck sweatshirt. Minor wear on the cuffs but otherwise in great condition. Perfect for game days.',
    seller: 'cougfan99',
    postedDate: 'March 1, 2026',
  }

  return (
    <div className="detail-page">

      <nav className="dash-navbar">
        <span className="dash-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Campus Closet</span>
        <div className="dash-nav-actions">
          <button className="dash-icon-btn" onClick={() => navigate('/shop')}>Shop</button>
          <button className="dash-icon-btn">Cart</button>
          <button className="dash-icon-btn">Profile</button>
        </div>
      </nav>

      <div className="detail-content">

        <button className="back-btn" onClick={() => navigate('/shop')}>← Back to Shop</button>

        <div className="detail-layout">

          {/* Image */}
          <div className="detail-img" style={{ background: product.color }}>
            <span className="detail-school">{product.school}</span>
          </div>

          {/* Info */}
          <div className="detail-info">
            <p className="detail-school-tag">{product.school}</p>
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-price">${product.price}</p>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Size</span>
                <span className="meta-value">{product.size}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Condition</span>
                <span className="meta-value">{product.condition}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Seller</span>
                <span className="meta-value">@{product.seller}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Posted</span>
                <span className="meta-value">{product.postedDate}</span>
              </div>
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-actions">
              <button className="btn-add-cart">Add to Cart</button>
              <button className="btn-like">Like</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}