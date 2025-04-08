import express, { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBookManually,
  createBookByIsbn,
  updateBook,
  deleteBook
} from '../controllers/booksController';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/', getAllBooks as express.RequestHandler);
router.get('/:id', getBookById as express.RequestHandler);

// Protected routes
router.post('/', authenticate, createBookManually as express.RequestHandler);
router.post('/isbn', authenticate, createBookByIsbn as express.RequestHandler);
router.put('/:id', authenticate, updateBook as express.RequestHandler);
router.delete('/:id', authenticate, deleteBook as express.RequestHandler);

export default router;