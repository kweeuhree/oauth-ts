import express from "express";
import cors from "cors";
import { auth } from "express-openid-connect";
require("dotenv").config();

import { router } from "./routes/routes";
import { loggerMiddleware, errorHandlerMiddleware } from "./middleware/index";
import { log } from "./appLogger";

const app = express();

const portEnv = process.env.PORT;
const PORT = (portEnv && parseInt(portEnv)) || 8080;

const secret = process.env.SECRET;
const baseURL = "http://localhost:8000/api";
const clientID = process.env.CLIENT_ID;
const issuerBaseURL = process.env.ISSUER_BASE_URL;

// Middlwares
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://dev-7g6qecoq3abboxr7.us.auth0.com",
  "http://localhost:5173",
];
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret,
  baseURL,
  clientID,
  issuerBaseURL,
};

// Error handling and auth middlware
app.use(errorHandlerMiddleware);
app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

// Routes
app.use("/", router);

const server = app.listen(PORT, "0.0.0.0", (error: any) => {
  if (error) {
    throw error;
  }
  log(`Listening on ${PORT}`);
});
