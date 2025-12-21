import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

/**
 * Navbar Component
 * 
 * Main navigation bar component for the application.
 * 
 * @param {Function} onSignInClick - Callback function when Sign In is clicked
 */
const Navbar = ({ onSignInClick }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <a href="#blog">Blog</a>
          <a href="#help">Help</a>
          <a href="#community">Community</a>
        </div>
        <div className="nav-center">
          <Link to="/" className="logo-link">
            <h1 className="logo">AI-Mental Health ChatBot</h1>
          </Link>
        </div>
        <div className="nav-right">
          <a href="#" className="signin-link" onClick={(e) => { e.preventDefault(); onSignInClick(); }}>
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

