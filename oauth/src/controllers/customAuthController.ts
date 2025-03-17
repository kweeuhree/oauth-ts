import { Request, Response } from "express";

import { googleAuth, githubAuth } from "../services/index.ts";

import {
  LOGGED_IN_REACT_ADDRESS,
  HOME_REACT_ADDRESS,
} from "../config/index.ts";
import { generateToken, generateRandomHexString } from "../utils/index.ts";
import { GSession, UserPayload } from "../types/index.ts";

const handleSignIn = async (
  req: Request,
  res: Response,
  authService: any,
  sessionState: string
) => {
  const state = generateRandomHexString();
  (req.session as GSession)[sessionState] = state;
  // Generate a url that asks permissions defined scopes
  const authorizationUrl = authService.generateAuthUrl(state);
  // Redirect the user to authorizationUrl
  res.redirect(authorizationUrl);
};

const handleCallback = async (
  req: Request,
  res: Response,
  authService: any,
  sessionState: string
) => {
  try {
    const user = await authService.authenticate(req);
    if (!user) return;
    sendCookieAndRedirect(res, user);
  } catch (error) {
    res.redirect(String(HOME_REACT_ADDRESS));
  } finally {
    (req.session as GSession)[sessionState] = "";
  }
};

// =======================================
// GitHub
// =======================================

export const githubSignIn = async (req: Request, res: Response) => {
  handleSignIn(req, res, githubAuth, "githubAuthState");
};

export const githubCallback = async (req: Request, res: Response) => {
  handleCallback(req, res, githubAuth, "githubAuthState");
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
    sendCookieAndRedirect(res, user);
  } catch (error) {
    res.redirect(String(HOME_REACT_ADDRESS));
  } finally {
    (req.session as GSession).googleAuthState = "";
  }
};

// =======================================
// Send cookie and redirect to React
// =======================================

const sendCookieAndRedirect = (res: Response, user: UserPayload) => {
  try {
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
