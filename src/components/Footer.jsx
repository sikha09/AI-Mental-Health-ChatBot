import '../styles/Footer.css';

/**
 * Footer Component
 * 
 * Application footer with links and copyright information.
 */
const Footer = () => {
  return (
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
  );
};

export default Footer;

