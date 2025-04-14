import express, { Router } from "express";
import {
  getBookReviews,
  updateReview,
  deleteReview,
} from "../../controllers/reviewsController";
import { authenticate, isAdmin } from "../../middleware/auth";
import { connectDatabase } from "../../db/database";

const router: Router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// Get all reviews (admin only)
router.get("/", async (req, res) => {
  try {
    const db = await connectDatabase();
    const reviews = await db.all(
      `SELECT r.*, u.name as user_name, b.title as book_title
       FROM reviews r
       LEFT JOIN users u ON r.userId = u.id
       LEFT JOIN books b ON r.bookId = b.id
       ORDER BY r.createdAt DESC`
    );
    res.status(200).json(reviews);
  } catch (error: any) {
    console.error("Error fetching all reviews:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Review routes for admin
router.get("/book/:bookId", getBookReviews);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;
