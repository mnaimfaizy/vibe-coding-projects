import React from 'react';
import './CommentQuestion.css';

interface CommentQuestionProps {
  questionNumber: number;
  questionText: string;
  commentValue: string;
  onCommentChange: (comment: string) => void;
}

const CommentQuestion: React.FC<CommentQuestionProps> = ({
  questionNumber,
  questionText,
  commentValue,
  onCommentChange
}) => {
  return (
    <div className="comment-question-container">
      <h2 className="question-number">Question {questionNumber}</h2>
      <h3 className="question-text">{questionText}</h3>
      
      <div className="comment-field">
        <textarea
          rows={5}
          placeholder="Please share your thoughts here..."
          value={commentValue}
          onChange={(e) => onCommentChange(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
};

export default CommentQuestion;