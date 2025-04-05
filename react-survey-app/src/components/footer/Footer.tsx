import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Electronic Store Feedback System</p>
        <p className="privacy-note">Your feedback is anonymous and will be used to improve our products and services.</p>
      </div>
    </footer>
  );
};

export default Footer;