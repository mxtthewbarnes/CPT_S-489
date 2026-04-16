import { getSchoolColor, formatCurrency } from '../lib/listings'
import '../pages/Dashboard.css'

/**
 * Compact card that renders a single listing on the dashboard, shop, and wishlist grids.
 *
 * Props:
 * - listing: the serialized listing object returned by the API. Expected fields
 *            are `title`, `school`, `price`, `imageUrl`, `category`, `size`, and `condition`.
 * - onClick: handler invoked when the card is pressed. Pages use this to navigate to
 *            the product detail page or, for the seller's own drafts, to the edit form.
 *
 * When no photo is present the card falls back to a school-colored tile so drafts
 * and seeded placeholder listings still render cleanly.
 */
export default function ListingCard({ listing, onClick }) {
  const title = listing.title || 'Untitled Draft'
  const school = listing.school || 'Campus Closet'

  return (
    <button className="item-card reset-button" onClick={onClick} type="button">
      {listing.imageUrl ? (
        <img alt={title} className="item-img item-img-photo" src={listing.imageUrl} />
      ) : (
        <div className="item-img" style={{ background: getSchoolColor(school) }}>
          <span className="item-school">{school}</span>
        </div>
      )}
      <div className="item-info">
        <p className="item-name">{title}</p>
        <p className="item-price">{formatCurrency(listing.price)}</p>
        <p className="item-meta">
          {[listing.category, listing.size, listing.condition].filter(Boolean).join(' • ') || school}
        </p>
      </div>
    </button>
  )
}
