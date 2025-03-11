"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const index_1 = require("../controllers/index");
exports.router = express_1.default.Router();
exports.router.get("/signup", index_1.authController.signup);
exports.router.get("/google/callback", index_1.authController.googleCallback);
exports.router.post("/login", index_1.authController.login);
exports.router.get("/getter", authMiddleware_1.authMiddleware, index_1.userController.get);
