import express from "express";
import cors from "cors";
import { auth } from "express-openid-connect";
require("dotenv").config();

import { config } from "./config/auth0Config";
import { router } from "./routes/routes";
import { loggerMiddleware, errorHandlerMiddleware } from "./middleware/index";
import { log } from "./appLogger";

const app = express();

const portEnv = process.env.PORT;
const PORT = (portEnv && parseInt(portEnv)) || 8080;

// Middlwares
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  // "https://dev-7g6qecoq3abboxr7.us.auth0.com", // <- auth0 origin
  "http://localhost:5173",
];
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

// Error handling and auth middlware
app.use(errorHandlerMiddleware);

// app.use(auth(config));

// // Middleware to make the `user` object available for all views
// app.use(function (req, res, next) {
//   res.locals.user = req.oidc.user;
//   next();
// });

// Routes
app.use("/", router);

const server = app.listen(PORT, "0.0.0.0", (error: any) => {
  if (error) {
    throw error;
  }
  log(`Listening on ${PORT}`);
});
