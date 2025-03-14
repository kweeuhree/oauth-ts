import { Request, Response } from "express";

import { googleAuth } from "../services/GoogleAuth";

import {
  LOGGED_IN_REACT_ADDRESS,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "../config";
import { generateToken, generateRandomHexString } from "../utils";
import { GSession } from "../types";

let users: string[] = [];

// =======================================
// GitHub
// =======================================

export const githubSignIn = async (req: Request, res: Response) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`
  );
};

export const githubCallback = async (req: Request, res: Response) => {
  const code = req.query.code;
  const access_token = await getAccessToken(
    String(code),
    String(GITHUB_CLIENT_ID),
    String(GITHUB_CLIENT_SECRET)
  );
  if (access_token) {
    (req.session as GSession).token = access_token;
    const user = await fetchGitHubUser(access_token);
    if (user) {
      res.redirect(LOGGED_IN_REACT_ADDRESS);
    } else {
      res.send("GitHub authentication error");
    }
  }
};

async function fetchGitHubUser(token: string) {
  const request = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "token " + token,
    },
  });
  if (request.ok) {
    return await request.json();
  }
}

async function getAccessToken(
  code: string,
  client_id: string,
  client_secret: string
) {
  const request = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
    }),
  });
  const text = await request.text();
  const params = new URLSearchParams(text);
  const access_token = params.get("access_token");
  if (!access_token) {
    throw new Error("failed to get access token");
  }
  return access_token;
}

// =======================================
// Google
// =======================================

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const state = generateRandomHexString();
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
    const authenticated = await googleAuth.authenticate(req);

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
