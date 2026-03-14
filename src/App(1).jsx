import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignInPopup from './components/SignInPopup';
import './styles/App.css';

/**
 * Main App Component
 * 
 * Root component of the application containing all main sections.
 */
function App() {
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  return (
    <>
      <div className={`app ${showSignInPopup ? 'blurred' : ''}`}>
        <Navbar onSignInClick={() => setShowSignInPopup(true)} />

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
            your eyes. Your ChatBot is always ready to chat when you need an empathetic friend.
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

      <SignInPopup
        isOpen={showSignInPopup}
        onClose={() => setShowSignInPopup(false)}
      />
    </>
  );
}



export default App;
