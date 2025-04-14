import express, { Router } from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../../controllers/authorsController";
import { authenticate, isAdmin } from "../../middleware/auth";

const router: Router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// Author routes for admin
router.get("/", getAllAuthors);
router.get("/:id", getAuthorById);
router.post("/", createAuthor);
router.put("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);

export default router;
