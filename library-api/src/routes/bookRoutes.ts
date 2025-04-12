import express, { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBookManually,
  createBookByIsbn,
  updateBook,
  deleteBook,
  searchOpenLibrary,
  addToUserCollection,
  removeFromUserCollection,
  getUserCollection,
} from "../controllers/booksController";
import { authenticate } from "../middleware/auth";

const router: Router = express.Router();

// Public routes
router.get("/", getAllBooks as express.RequestHandler);
router.get("/search/openlibrary", searchOpenLibrary as express.RequestHandler);
router.get("/:id", getBookById as express.RequestHandler);

// Protected routes
router.post("/", authenticate, createBookManually as express.RequestHandler);
router.post("/isbn", authenticate, createBookByIsbn as express.RequestHandler);
router.put("/:id", authenticate, updateBook as express.RequestHandler);
router.delete("/:id", authenticate, deleteBook as express.RequestHandler);

// User collection routes
router.get(
  "/user/collection",
  authenticate,
  getUserCollection as express.RequestHandler
);
router.post(
  "/user/collection",
  authenticate,
  addToUserCollection as express.RequestHandler
);
router.delete(
  "/user/collection/:bookId",
  authenticate,
  removeFromUserCollection as express.RequestHandler
);

export default router;
