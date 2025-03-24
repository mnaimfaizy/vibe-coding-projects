import React from 'react';
import { Rating } from '../../../models/SurveyTypes';
import { RATINGS } from '../../../data/surveyData';
import './MultipleChoiceQuestion.css';

interface MultipleChoiceQuestionProps {
  questionNumber: number;
  questionText: string;
  selectedRating: Rating | undefined;
  onRatingChange: (rating: Rating) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  questionNumber,
  questionText,
  selectedRating,
  onRatingChange
}) => {
  return (
    <div className="question-container">
      <h2 className="question-number">Question {questionNumber}</h2>
      <h3 className="question-text">{questionText}</h3>
      
      <div className="ratings-container">
        {RATINGS.map((rating) => (
          <div className="rating-option" key={rating}>
            <input
              type="radio"
              id={`rating-${questionNumber}-${rating}`}
              name={`question-${questionNumber}`}
              value={rating}
              checked={selectedRating === rating}
              onChange={() => onRatingChange(rating as Rating)}
            />
            <label htmlFor={`rating-${questionNumber}-${rating}`}>
              {rating}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;