import express from "express";
import { requiresAuth } from "express-openid-connect";

import { authMiddleware } from "../middleware/authMiddleware";
import {
  customAuthController,
  authController,
  userController,
} from "../controllers/index";

export const router = express.Router();

// "login" is reserved by Auth0 <------
// router.post("/login", authController.login);

// Google OAuth
router.get("/auth/google", customAuthController.googleSignIn);
router.get("/google-callback", customAuthController.googleCallback);

// GitHub OAuth
router.get("/auth/github", customAuthController.githubSignIn);
router.get("/github-callback", customAuthController.githubCallback);

// Auth0
router.post("/api/callback", authController.auth0callback);
router.get("/getter", authMiddleware, userController.get);
