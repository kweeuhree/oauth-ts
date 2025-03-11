import express from "express";
import { requiresAuth } from "express-openid-connect";

import { authMiddleware } from "../middleware/authMiddleware";
import { authController, userController } from "../controllers/index";

export const router = express.Router();

// "login" is reserved by Auth0 <------
// router.post("/login", authController.login);
router.get("/signup", authController.signup);
router.post("/api/callback", authController.auth0callback);
router.get("/getter", authMiddleware, userController.get);
