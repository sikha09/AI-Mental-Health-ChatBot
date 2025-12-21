import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup submitted:', formData);
    // Handle signup logic here
    // After successful signup, navigate to chat
    navigate('/chat');
  };

  const signupWithGoogle = () => {
    console.log('Google signup clicked');
    window.location.href = '/auth/google';
  };

  const signupWithFacebook = () => {
    console.log('Facebook signup clicked');
    window.location.href = '/auth/facebook';
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <div className="robot-illustration">
          <div className="decorative-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
          <div className="robot">
            <div className="robot-head">
              <div className="robot-screen">
                <div className="robot-eyes">
                  <div className="eye eye-left"></div>
                  <div className="eye eye-right"></div>
                </div>
              </div>
              <div className="robot-antenna left-antenna"></div>
              <div className="robot-antenna right-antenna"></div>
            </div>
            <div className="robot-body">
              <div className="robot-core"></div>
            </div>
            <div className="robot-arm left-arm"></div>
            <div className="robot-arm right-arm"></div>
            <div className="robot-leg left-leg"></div>
            <div className="robot-leg right-leg"></div>
          </div>
          <div className="chat-bubble user-bubble">
            <p>Hello, Can you help me?</p>
          </div>
          <div className="chat-bubble robot-bubble">
            <div className="bubble-header">
              <span>Buddy!</span>
              <div className="bubble-icons">
                <span className="icon">📋</span>
                <span className="icon">👍</span>
              </div>
            </div>
            <p>Sure, Buddy is ready to help you</p>
          </div>
        </div>
      </div>

      <div className="right-section">
        <div className="form-container">
          <div className="logo-icon">
            <div className="robot-logo">
              <div className="logo-face">
                <div className="logo-eyes">
                  <div className="logo-eye"></div>
                  <div className="logo-eye"></div>
                </div>
                <div className="logo-smile"></div>
              </div>
            </div>
          </div>

          <h1 className="title">Welcome to Sign Up <span className="highlight">Buddy!</span></h1>

          <form onSubmit={handleSubmit}>
            {/* <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div> */}

            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I agree to <a href="#terms">Terms of Conditions</a> and <a href="#privacy">Privacy of Policy</a>
              </label>
            </div>

            <button type="submit" className="signup-btn">Sign Up</button>

            <p className="signin-text">
              Already have an account? <Link to="/" className="signin-link">Sign In</Link>
            </p>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-btn google-btn" onClick={signupWithGoogle}>
                <span className="social-icon">G</span>
                Google
              </button>
              <button type="button" className="social-btn facebook-btn" onClick={signupWithFacebook}>
                <span className="social-icon">f</span>
                Facebook
              </button>
            </div>

            <div className="footer-links">
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

