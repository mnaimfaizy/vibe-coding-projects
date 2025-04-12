import express, { Router } from "express";
import {
  register,
  login,
  logout,
  changePassword,
  requestPasswordReset,
  resetPassword,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerification,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router: Router = express.Router();

// Public routes
router.post("/register", register as express.RequestHandler);
router.post("/login", login as express.RequestHandler);
router.post("/logout", logout as express.RequestHandler);
router.post(
  "/request-password-reset",
  requestPasswordReset as express.RequestHandler
);
router.post("/reset-password", resetPassword as express.RequestHandler);

// Email verification routes
router.get("/verify-email/:token", verifyEmail as express.RequestHandler);
router.post(
  "/resend-verification",
  resendVerification as express.RequestHandler
);

// Protected routes
router.post(
  "/change-password",
  authenticate,
  changePassword as express.RequestHandler
);
router.put(
  "/update-profile",
  authenticate,
  updateUser as express.RequestHandler
);
router.delete(
  "/delete-account",
  authenticate,
  deleteUser as express.RequestHandler
);

export default router;
