import express from "express";
import session from "express-session";
import cors from "cors";
import "dotenv/config";

import { router } from "./routes/routes.js";
import {
  loggerMiddleware,
  errorHandlerMiddleware,
} from "./middleware/index.js";
import { HOME_REACT_ADDRESS } from "./config/index.js";
import { log } from "./appLogger.js";

const app = express();

const portEnv = process.env.PORT;
const PORT = (portEnv && parseInt(portEnv)) || 8080;

// Middlwares
// Middleware to initialize session
const sessionSecret = String(process.env.SESSION_SECRET);
app.use(
  session({ secret: sessionSecret, resave: false, saveUninitialized: true })
);
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [String(HOME_REACT_ADDRESS)];
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

// Error handling and auth middlware
app.use(errorHandlerMiddleware);

// Routes
app.use("/", router);

const server = app.listen(PORT, "0.0.0.0", (error: any) => {
  if (error) {
    throw error;
  }
  log(`Listening on ${PORT}`);
});
