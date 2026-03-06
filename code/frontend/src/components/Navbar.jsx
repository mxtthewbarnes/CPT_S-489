import './Navbar.css'


export default function Navbar() {
    return (
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand" href="#">Campus Closet</a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link" href="#">Shop</a>
            <a className="nav-link" href="#">Sell</a>
            <a className="nav-link" href="#">Login</a>
          </div>
        </div>
      </nav>
    )
  }