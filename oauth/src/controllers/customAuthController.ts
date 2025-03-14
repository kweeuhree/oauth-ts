import { Request, Response } from "express";

import { googleAuth, githubAuth } from "../services/index.js";

import {
  LOGGED_IN_REACT_ADDRESS,
  HOME_REACT_ADDRESS,
} from "../config/index.js";
import { generateToken, generateRandomHexString } from "../utils/index.js";
import { GSession } from "../types.js";

let users: string[] = [];

interface UserPayload {
  email: string;
  name: string;
}

// =======================================
// GitHub
// =======================================

export const githubSignIn = async (req: Request, res: Response) => {
  const state = generateRandomHexString();
  (req.session as GSession).githubAuthState = state;
  // Generate a url that asks permissions defined scopes
  const authorizationUrl = githubAuth.generateAuthUrl(state);
  // Redirect the user to authorizationUrl
  res.redirect(authorizationUrl);
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const user = await githubAuth.authenticate(req);
    if (!user) return;
    processUserAndSendResponse(res, user);
  } catch (error) {
    res.redirect(String(HOME_REACT_ADDRESS));
  } finally {
    (req.session as GSession).githubAuthState = "";
  }
};

// =======================================
// Google
// =======================================

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const state = generateRandomHexString();
    (req.session as GSession).googleAuthState = state;
    // Generate a url that asks permissions defined scopes
    const authorizationUrl = googleAuth.generateAuthUrl(state);
    // Redirect the user to authorizationUrl
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error(error);
    res.end(error);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = await googleAuth.authenticate(req);
    if (!user) return;
    processUserAndSendResponse(res, user);
  } catch (error) {
    res.redirect(String(HOME_REACT_ADDRESS));
  } finally {
    (req.session as GSession).googleAuthState = "";
  }
};

const processUserAndSendResponse = (res: Response, user: UserPayload) => {
  try {
    // =======================================
    // Database interaction
    // =======================================
    interactWithDatabase(user);
    // =======================================

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.redirect(LOGGED_IN_REACT_ADDRESS);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

const interactWithDatabase = (user: UserPayload) => {
  if (!user.email) return;
  let exists = users.includes(user.email);
  if (!exists) {
    users.push(user.email);
  }
};
