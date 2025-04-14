import express, { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBookManually,
  createBookByIsbn,
  updateBook,
  deleteBook,
} from "../../controllers/booksController";
import { authenticate, isAdmin } from "../../middleware/auth";

const router: Router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// Book routes for admin
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", createBookManually);
router.post("/isbn", createBookByIsbn);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
