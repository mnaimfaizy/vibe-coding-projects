import express, { Router } from "express";
import userRoutes from "./userRoutes";

const router: Router = express.Router();

// Mount admin sub-routes
router.use("/users", userRoutes);

// We'll add more admin routes here as we expand functionality
// Example: router.use("/stats", statsRoutes);

export default router;
