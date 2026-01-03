import { Link } from 'react-router-dom';
import { useState } from 'react';
import { signIn, signInWithGoogle, signInWithFacebook } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/SignInPopup.css';

/**
 * SignInPopup Component
 * 
 * Modal popup for user sign in functionality with error handling.
 * 
 * @param {Boolean} isOpen - Controls popup visibility
 * @param {Function} onClose - Callback function to close popup
 */
const SignInPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await signIn(formData.email, formData.password);

      if (response.success) {
        // Successfully signed in
        onClose();
        navigate('/chat');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);

      // Handle specific error messages
      if (err.message.includes('Invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    try {
      signInWithGoogle();
    } catch (err) {
      setError('Failed to initiate Google sign in. Please try again.');
    }
  };

  const handleFacebookSignIn = () => {
    try {
      signInWithFacebook();
    } catch (err) {
      setError('Failed to initiate Facebook sign in. Please try again.');
    }
  };

  return (
    <div className="signin-popup-overlay" onClick={onClose}>
      <div className="signin-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Sign In to Chatbot</h2>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`signin-input ${fieldErrors.email ? 'error' : ''}`}
              disabled={loading}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`signin-input ${fieldErrors.password ? 'error' : ''}`}
              disabled={loading}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="oauth-divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleSignIn} className="google-btn" disabled={loading}>
          🔍 Sign In with Google
        </button>
        <button onClick={handleFacebookSignIn} className="facebook-btn" disabled={loading}>
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
