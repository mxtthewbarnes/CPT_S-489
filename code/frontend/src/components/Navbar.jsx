import './Navbar.css'


export default function Navbar() {
    return (
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand" href="#">Campus Closet</a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link" href="#">Login</a>
            <a className="btn btn-light ms-2" href="#">Register</a>
            
          </div>
        </div>
      </nav>
    )
  }