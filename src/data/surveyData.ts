import { Question } from '../models/SurveyTypes';

export const RATINGS = [
  'Very Satisfied', 
  'Satisfied', 
  'Somewhat Satisfied', 
  'Neutral', 
  'Somewhat Dissatisfied', 
  'Dissatisfied', 
  'Very Dissatisfied', 
  'Not Applicable'
];

export const SURVEY_QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    text: 'How satisfied are you with the overall quality of the electronic product you purchased?',
    required: true
  },
  {
    id: 2,
    type: 'multiple-choice',
    text: 'How would you rate the ease of setting up your new electronic product?',
    required: true
  },
  {
    id: 3,
    type: 'multiple-choice',
    text: 'How satisfied are you with the features and functionality of your product?',
    required: true
  },
  {
    id: 4,
    type: 'multiple-choice',
    text: 'How would you rate the value for money of your purchase?',
    required: true
  },
  {
    id: 5,
    type: 'multiple-choice',
    text: 'How satisfied are you with the customer service provided by our store?',
    required: true
  },
  {
    id: 6,
    type: 'multiple-choice',
    text: 'How would you rate the clarity of the product instructions and documentation?',
    required: true
  },
  {
    id: 7,
    type: 'multiple-choice',
    text: 'How satisfied are you with the delivery time and condition of your product?',
    required: true
  },
  {
    id: 8,
    type: 'multiple-choice',
    text: 'How likely are you to recommend our store to friends or family?',
    required: true
  },
  {
    id: 9,
    type: 'multiple-choice',
    text: 'How would you rate your overall shopping experience with our electronic store?',
    required: true
  },
  {
    id: 10,
    type: 'comment',
    text: 'Do you have any additional comments or suggestions about your experience with our electronic store or the product you purchased?',
    required: false
  }
];