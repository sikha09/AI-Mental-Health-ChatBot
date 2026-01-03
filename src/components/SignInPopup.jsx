import { Link } from 'react-router-dom';
import '../styles/SignInPopup.css';

/**
 * SignInPopup Component
 * 
 * Modal popup for user sign in functionality.
 * 
 * @param {Boolean} isOpen - Controls popup visibility
 * @param {Function} onClose - Callback function to close popup
 * @param {Object} formData - Form state data
 * @param {Function} handleChange - Form input change handler
 * @param {Function} handleSubmit - Form submit handler
 * @param {Function} signInWithGoogle - Google sign in handler
 * @param {Function} signInWithFacebook - Facebook sign in handler
 */
const SignInPopup = ({
  isOpen,
  onClose,
  formData,
  handleChange,
  handleSubmit,
  signInWithGoogle,
  signInWithFacebook
}) => {
  if (!isOpen) return null;

  return (
    <div className="signin-popup-overlay" onClick={onClose}>
      <div className="signin-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Sign In to Chatbot</h2>
        <form onSubmit={handleSubmit} className="signin-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="signin-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="signin-input"
          />
          <button type="submit" className="signin-btn">
            Sign In
          </button>
        </form>
        <div className="oauth-divider">
          <span>OR</span>
        </div>
        <button onClick={signInWithGoogle} className="google-btn">
          🔍 Sign In with Google
        </button>
        <button onClick={signInWithFacebook} className="facebook-btn">
          📘 Sign In with Facebook
        </button>
        <p className="signup-text">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link" onClick={onClose}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPopup;

