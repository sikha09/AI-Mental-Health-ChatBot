import { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    console.log("Sign In with:", email, password);
    // Handle sign in logic here
    setShowSignInPopup(false);
  };

  const signInWithGoogle = () => {
    console.log("Google sign in clicked");
    window.location.href = "/auth/google";
  };

  return (
    <>
      <div className={`app ${showSignInPopup ? 'blurred' : ''}`}>
        {/* Navigation Bar */}
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
              <a href="#" className="signin-link" onClick={(e) => { e.preventDefault(); setShowSignInPopup(true); }}>Sign In</a>
            </div>
          </div>
        </nav>

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
          <div className="platforms">
            {/* <span className="platform-text">also available on</span>
            <div className="platform-icons">
              <span className="platform-icon">📱 iOS</span>
              <span className="platform-icon">🤖 Android</span>
              <span className="platform-icon">🥽 Oculus</span>
            </div> */}
          </div>
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
              {/* <button className="cta-button">Create your Replika</button> */}
              <div className="platforms">
                {/* <span className="platform-text">also available on</span>
                <div className="platform-icons">
                  <span className="platform-icon">📱 iOS</span>
                  <span className="platform-icon">🤖 Android</span>
                  <span className="platform-icon">🥽 Oculus</span>
                </div> */}
              </div>
            </div>
            <div className="characters">
              <div className="character">👤</div>
              <div className="character">👤</div>
              <div className="character">👤</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-column">
              <h4 className="footer-heading">About AI-Mental Health ChatBot</h4>
              <a href="#" className="footer-link">Our story</a>
              <a href="#" className="footer-link">Press & media</a>
              <a href="#" className="footer-link">Careers</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Help & support</h4>
              <a href="#" className="footer-link">Help center</a>
              <a href="#" className="footer-link">Contact us</a>
              <a href="#" className="footer-link">Report a bug</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Join our community</h4>
              <a href="#" className="footer-link">Reddit</a>
              <a href="#" className="footer-link">Discord</a>
              <a href="#" className="footer-link">Facebook</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Get the app</h4>
              <a href="#" className="footer-link">iOS</a>
              <a href="#" className="footer-link">Android</a>
              <a href="#" className="footer-link">Oculus</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">Copyright © 2020 Luka, Inc. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#" className="footer-link">Terms of service</a>
              <a href="#" className="footer-link">Privacy policy</a>
              <a href="#" className="footer-link">Cookies policy</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Sign In Popup - Outside blurred container */}
      {showSignInPopup && (
        <div className="signin-popup-overlay" onClick={() => setShowSignInPopup(false)}>
          <div className="signin-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSignInPopup(false)}>×</button>
            <h2>Sign In to Chatbot</h2>
            <form onSubmit={handleSignIn} className="signin-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="signin-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="signin-input"
              />
              <button type="submit" className="signin-btn">
                Sign In
              </button>
            </form>
            <button onClick={signInWithGoogle} className="google-btn">
              Sign In with Google
            </button>
            <p className="signup-text">
              Don't have an account?{' '}
              <Link to="/signup" className="signup-link" onClick={() => setShowSignInPopup(false)}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
