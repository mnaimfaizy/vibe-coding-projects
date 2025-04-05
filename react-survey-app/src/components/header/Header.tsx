import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Electronic Product Satisfaction Survey</h1>
        <p>Thank you for your recent purchase. We value your feedback!</p>
      </div>
    </header>
  );
};

export default Header;