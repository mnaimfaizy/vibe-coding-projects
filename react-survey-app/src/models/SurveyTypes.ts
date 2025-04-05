export type Rating = 
  | 'Very Satisfied' 
  | 'Satisfied' 
  | 'Somewhat Satisfied' 
  | 'Neutral' 
  | 'Somewhat Dissatisfied' 
  | 'Dissatisfied' 
  | 'Very Dissatisfied' 
  | 'Not Applicable';

export interface MultipleChoiceQuestion {
  id: number;
  type: 'multiple-choice';
  text: string;
  required: boolean;
}

export interface CommentQuestion {
  id: number;
  type: 'comment';
  text: string;
  required: boolean;
}

export type Question = MultipleChoiceQuestion | CommentQuestion;

export interface SurveyResponse {
  questionId: number;
  rating?: Rating;
  comment?: string;
}

export interface SurveyState {
  currentQuestionIndex: number;
  responses: SurveyResponse[];
  isComplete: boolean;
}