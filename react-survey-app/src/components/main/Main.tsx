import React, { useState } from 'react';
import './Main.css';
import ProgressBar from './progress-bar/ProgressBar';
import MultipleChoiceQuestion from './multiple-choice-question/MultipleChoiceQuestion';
import CommentQuestion from './comment-question/CommentQuestion';
import ThankYou from './thank-you/ThankYou';
import { SURVEY_QUESTIONS } from '../../data/surveyData';
import { Rating, SurveyResponse } from '../../models/SurveyTypes';

const Main: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const totalQuestions = SURVEY_QUESTIONS.length;
  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];
  
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
      // You could also add logic here to submit the survey responses to a server
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRatingChange = (rating: Rating) => {
    const updatedResponses = [...responses];
    const existingResponseIndex = updatedResponses.findIndex(
      (response) => response.questionId === currentQuestion.id
    );

    if (existingResponseIndex !== -1) {
      updatedResponses[existingResponseIndex] = {
        ...updatedResponses[existingResponseIndex],
        rating
      };
    } else {
      updatedResponses.push({
        questionId: currentQuestion.id,
        rating
      });
    }

    setResponses(updatedResponses);
  };

  const handleCommentChange = (comment: string) => {
    const updatedResponses = [...responses];
    const existingResponseIndex = updatedResponses.findIndex(
      (response) => response.questionId === currentQuestion.id
    );

    if (existingResponseIndex !== -1) {
      updatedResponses[existingResponseIndex] = {
        ...updatedResponses[existingResponseIndex],
        comment
      };
    } else {
      updatedResponses.push({
        questionId: currentQuestion.id,
        comment
      });
    }

    setResponses(updatedResponses);
  };

  const getCurrentResponse = () => {
    return responses.find(response => response.questionId === currentQuestion?.id);
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    const response = getCurrentResponse();
    
    if (currentQuestion.required) {
      if (currentQuestion.type === 'multiple-choice') {
        return !!response?.rating;
      } else if (currentQuestion.type === 'comment') {
        return !!response?.comment && response.comment.trim() !== '';
      }
    }
    
    return true;
  };

  if (isComplete) {
    return <ThankYou />;
  }

  return (
    <main className="main-container">
      <div className="survey-container">
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />

        {currentQuestion.type === 'multiple-choice' && (
          <MultipleChoiceQuestion
            questionNumber={currentQuestionIndex + 1}
            questionText={currentQuestion.text}
            selectedRating={getCurrentResponse()?.rating}
            onRatingChange={handleRatingChange}
          />
        )}

        {currentQuestion.type === 'comment' && (
          <CommentQuestion
            questionNumber={currentQuestionIndex + 1}
            questionText={currentQuestion.text}
            commentValue={getCurrentResponse()?.comment || ''}
            onCommentChange={handleCommentChange}
          />
        )}

        <div className="navigation-buttons">
          <button 
            className="button button-previous" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          <button 
            className="button button-next" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Main;