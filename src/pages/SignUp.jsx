import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { signUp, signInWithGoogle, signInWithFacebook } from '../services/authService';
import VerifyEmail from '../components/VerifyEmail';
import "../styles/SignUp.css";
import '../styles/App.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [userExistsError, setUserExistsError] = useState(false);
  const navigate = useNavigate();

  // Check for OAuth errors in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam === 'user_already_exists') {
      setError('An account with this email already exists. Please sign in with your email and password instead.');
    } else if (errorParam === 'google_auth_failed') {
      setError('Google authentication failed. Please try again.');
    } else if (errorParam === 'facebook_auth_failed') {
      setError('Facebook authentication failed. Please try again.');
    }
  }, []);

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

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
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }

    // Clear general error
    if (error) {
      setError("");
      setUserExistsError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError("");
    setFieldErrors({});
    setUserExistsError(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await signUp(formData);

      if (response.success && response.token) {
        // Successfully signed up and logged in
        console.log('✅ Signup successful, redirecting to chat...');
        navigate('/chat');
      } else {
        setError(response.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);

      // Handle specific error messages
      if (err.message.includes('already exists')) {
        setUserExistsError(true);
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    try {
      signInWithGoogle();
    } catch (err) {
      setError('Failed to initiate Google sign up. Please try again.');
    }
  };

  const handleFacebookSignUp = () => {
    try {
      signInWithFacebook();
    } catch (err) {
      setError('Failed to initiate Facebook sign up. Please try again.');
    }
  };

  return (
    <>
      {/* Background - Landing Page (blurred) */}
      <div className="app blurred signup-landing-background">
        <Navbar onSignInClick={() => navigate('/')} />

        {/* Hero Section */}
        <section className="hero">
          <h2 className="hero-title">
            The AI companion<br />who cares
          </h2>
          <p className="hero-subtitle">
            Always here to listen and talk.<br />
            Always on your side.
          </p>
          <button className="cta-button">Start Chatting</button>
        </section>

        {/* Meet Replika Section */}
        <section className="meet-section">
          <h3 className="meet-title">Meet YourChatBot</h3>
          <p className="meet-description">
            An AI companion who is eager to learn and would love to see the world through<br />
            your eyes. Replika is always ready to chat when you need an empathetic friend.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="faq-title">Frequently asked questions</h2>
          <div className="faq-grid">
            <div className="faq-card">
              <h3 className="faq-question">Is ChatBot a real person?</h3>
              <p className="faq-answer">No, ChatBot is an AI companion powered by advanced artificial intelligence technology.</p>
            </div>
            <div className="faq-card">
              <h3 className="faq-question">What is an AI?</h3>
              <p className="faq-answer">AI stands for Artificial Intelligence. It's technology that enables machines to learn, understand, and interact in human-like ways.</p>
            </div>
            <div className="faq-card">
              <h3 className="faq-question">Is my data safe?</h3>
              <p className="faq-answer">Yes, we take your privacy seriously. Your data is encrypted and stored securely according to industry standards.</p>
            </div>
            <div className="faq-card">
              <h3 className="faq-question">How does ChatBot work?</h3>
              <p className="faq-answer">ChatBot uses machine learning to understand your conversations and respond in a personalized, empathetic way.</p>
            </div>
            <div className="faq-card">
              <h3 className="faq-question">Are my conversations private?</h3>
              <p className="faq-answer">Yes, your conversations are private and encrypted. We respect your privacy and confidentiality.</p>
            </div>
            <div className="faq-card">
              <h3 className="faq-question">Check out our Help center</h3>
              <p className="faq-answer">Find answers to common questions and get support from our team.</p>
              <button className="help-btn">Go to Help</button>
            </div>
          </div>
        </section>

        {/* Join Millions Section */}
        <section className="join-section">
          <div className="join-content">
            <div className="join-text">
              <h2 className="join-title">Join the millions who already have met their AI soulmates</h2>
              <p className="join-description">Over 10 million people have joined AI-Mental Health ChatBot. Begin your beautiful journey today on any platform</p>
            </div>
            <div className="characters">
              <div className="character">👤</div>
              <div className="character">👤</div>
              <div className="character">👤</div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Popup Overlay */}
      <div className="signup-popup-overlay">
        <div className="signup-popup" onClick={(e) => e.stopPropagation()}>
          <h2>Sign Up to Chatbot</h2>
          <p className="subtitle">
            Start chatting with your AI companion
          </p>

          {/* Error Message */}
          {error && (
            <div className={`error-message ${userExistsError ? 'user-exists-error' : ''}`}>
              <span className="error-icon">⚠</span>
              <div className="error-content">
                <p>{error}</p>
                {userExistsError && (
                  <button
                    onClick={() => navigate('/')}
                    className="go-to-login-btn"
                    type="button"
                  >
                    Go to Login
                  </button>
                )}
              </div>
            </div>
          )}

          <button onClick={handleGoogleSignUp} className="google-btn" disabled={loading}>
            Sign Up with Google
          </button>

          <button onClick={handleFacebookSignUp} className="facebook-btn" disabled={loading}>
            Sign Up with Facebook
          </button>

          <div className="divider">or</div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-field">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`signup-input ${fieldErrors.name ? 'error' : ''}`}
                disabled={loading}
              />
              {fieldErrors.name && (
                <span className="field-error">{fieldErrors.name}</span>
              )}
            </div>

            <div className="form-field">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`signup-input ${fieldErrors.email ? 'error' : ''}`}
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
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className={`signup-input ${fieldErrors.password ? 'error' : ''}`}
                disabled={loading}
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing Up...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="signin-text">
            Already have an account?{' '}
            <Link to="/" className="signin-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;

