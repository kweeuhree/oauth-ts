import express from "express";
import { customAuthController } from "../controllers/index.js";

export const router = express.Router();

// Google OAuth
router.get("/auth/google", customAuthController.googleSignIn);
router.get("/google-callback", customAuthController.googleCallback);

// GitHub OAuth
router.get("/auth/github", customAuthController.githubSignIn);
router.get("/github-callback", customAuthController.githubCallback);
