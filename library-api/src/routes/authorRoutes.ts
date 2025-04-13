import express, { Router } from "express";
import {
  getAllAuthors,
  getAuthorById,
  getAuthorByName,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  addBookToAuthor,
  removeBookFromAuthor,
  getAuthorInfo,
} from "../controllers/authorsController";
import { authenticate } from "../middleware/auth";

const router: Router = express.Router();

// Public routes
router.get("/", getAllAuthors as express.RequestHandler);
router.get("/id/:id", getAuthorById as express.RequestHandler);
router.get("/name/:name", getAuthorByName as express.RequestHandler);
router.get("/info", getAuthorInfo as express.RequestHandler);

// Protected routes
router.post("/", authenticate, createAuthor as express.RequestHandler);
router.put("/:id", authenticate, updateAuthor as express.RequestHandler);
router.delete("/:id", authenticate, deleteAuthor as express.RequestHandler);
router.post("/book", authenticate, addBookToAuthor as express.RequestHandler);
router.delete(
  "/:authorId/book/:bookId",
  authenticate,
  removeBookFromAuthor as express.RequestHandler
);

export default router;
