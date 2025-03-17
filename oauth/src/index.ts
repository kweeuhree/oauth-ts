import express from "express";
import session from "express-session";
import cors from "cors";
import "dotenv/config";

import { router } from "./routes/routes.ts";
import {
  loggerMiddleware,
  errorHandlerMiddleware,
} from "./middleware/index.ts";
import { HOME_REACT_ADDRESS } from "./config/index.ts";
import { log } from "./appLogger.ts";

const app = express();

const PORT = process.env.PORT;

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

const server = app.listen(Number(PORT), "0.0.0.0", (error: any) => {
  if (error) {
    throw error;
  }
  log(`Listening on ${PORT}`);
});
