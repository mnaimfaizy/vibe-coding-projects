import React from 'react';
import './ThankYou.css';

const ThankYou: React.FC = () => {
  return (
    <div className="thank-you-container">
      <div className="thank-you-icon">✓</div>
      <h2>Thank You for Your Feedback!</h2>
      <p>
        We appreciate the time you've taken to complete this survey.
        Your input helps us improve our products and services.
      </p>
      <p className="note">
        Your responses have been recorded. If you have any additional questions or concerns,
        please contact our customer service team.
      </p>
    </div>
  );
};

export default ThankYou;