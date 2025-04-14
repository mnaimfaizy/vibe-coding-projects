// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-api\src\routes\reviewRoutes.ts
import express from "express";
import {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController";
import { authenticateOptional } from "../middleware/auth";

const router = express.Router();

// Get all reviews for a book (public endpoint)
router.get("/books/:bookId/reviews", getBookReviews);

// Create a review for a book (public but tracks user ID if authenticated)
router.post("/books/:bookId/reviews", authenticateOptional, createReview);

// Update a review (requires authentication)
router.put("/reviews/:reviewId", authenticateOptional, updateReview);

// Delete a review (requires authentication)
router.delete("/reviews/:reviewId", authenticateOptional, deleteReview);

export default router;
