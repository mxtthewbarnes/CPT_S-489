import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-shell centered-shell">
      <div className="panel narrow-panel text-center">
        <p className="eyebrow">404</p>
        <h1 className="section-title">Page Not Found</h1>
        <p className="muted-copy">That route does not exist in the current Campus Closet build.</p>
        <Link className="btn btn-light mt-3" to="/">
          Back Home
        </Link>
      </div>
    </div>
  )
}
