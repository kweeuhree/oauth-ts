import { Request, Response } from "express";

import { randomBytes } from "node:crypto";
import { LOGGED_IN_REACT_ADDRESS } from "../config";
import { googleAuth } from "../services/GoogleAuth";
import { generateToken } from "../utils/generateToken";
import { GSession } from "../types";

let users: string[] = [];

const newState = (): string => {
  return randomBytes(32).toString("hex");
};

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const state = newState();
    (req.session as GSession).googleAuthState = state;
    // Generate a url that asks permissions for the Drive activity and Google Calendar scope
    const authorizationUrl = googleAuth.generateAuthUrl(state);
    // Redirect the user to authorizationUrl
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error(error);
    res.end(error);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  console.info("googleCallback");
  try {
    const authenticated = await googleAuth.authenticate(
      req.url,
      req.headers,
      (req.session as GSession).googleAuthState
    );
    console.log(authenticated);
    if (authenticated) {
      const { email, name } = authenticated;
      // =======================================
      // Database interaction
      // =======================================
      email && interactWithDatabase(email);
      // =======================================

      const token = email && name && generateToken({ email, name });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.redirect(LOGGED_IN_REACT_ADDRESS);
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Google authentication error: ", error });
    return;
  } finally {
    (req.session as GSession).googleAuthState = "";
  }
};

const interactWithDatabase = (email: string) => {
  let user = email && users.includes(email);
  if (email && !user) {
    users.push(email);
  }
};
