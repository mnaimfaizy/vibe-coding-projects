import express, { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
} from "../../controllers/admin/userController";
import { authenticate, isAdmin } from "../../middleware/auth";

const router: Router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// User management routes
router.get("/", getAllUsers as express.RequestHandler);
router.get("/:id", getUserById as express.RequestHandler);
router.post("/", createUser as express.RequestHandler);
router.put("/:id", updateUser as express.RequestHandler);
router.delete("/:id", deleteUser as express.RequestHandler);
router.post(
  "/:id/change-password",
  changeUserPassword as express.RequestHandler
);

export default router;
