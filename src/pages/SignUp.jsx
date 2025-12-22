import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import "../styles/SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign Up with:", formData);
    // Handle sign up logic here
    navigate('/chat');
  };

  const signUpWithGoogle = () => {
    console.log("Google sign up clicked");
    window.location.href = "/auth/google";
  };

  return (
    <>
      {/* Background (blurred) */}
      <div className="signup-background blurred">
        <h1>AI Mental Health Chatbot</h1>
        <p>Talk freely. Feel supported. Anytime.</p>
        <button>Get Started</button>
      </div>

      {/* Popup Overlay */}
      <div className="signup-popup-overlay">
        <div className="signup-popup" onClick={(e) => e.stopPropagation()}>
          <h2>Sign Up to Chatbot</h2>
          <p className="subtitle">
            Start chatting with your AI companion
          </p>

          <button onClick={signUpWithGoogle} className="google-btn">
            Sign Up with Google
          </button>

          <div className="divider">or</div>

          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <button type="submit" className="signup-btn">
              Sign Up
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

