import express, { Router } from "express";
import userRoutes from "./userRoutes";
import bookRoutes from "./bookRoutes";
import authorRoutes from "./authorRoutes";
import reviewRoutes from "./reviewRoutes";

const router: Router = express.Router();

// Mount admin sub-routes
router.use("/users", userRoutes);
router.use("/books", bookRoutes);
router.use("/authors", authorRoutes);
router.use("/reviews", reviewRoutes);

// We'll add more admin routes here as we expand functionality
// Example: router.use("/stats", statsRoutes);

export default router;
