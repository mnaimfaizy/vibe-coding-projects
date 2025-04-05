import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentQuestion, totalQuestions }) => {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="progress-text">
        Question {currentQuestion} of {totalQuestions}
      </div>
    </div>
  );
};

export default ProgressBar;