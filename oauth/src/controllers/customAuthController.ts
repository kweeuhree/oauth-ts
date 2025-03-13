import { Request, Response } from "express";
import { URL } from "node:url";

import {
  LOGGED_IN_REACT_ADDRESS,
  GOOGLE_OAUTH_SCOPES,
  googleAuthClient,
  oauth2,
  googleState,
} from "../config";
import { generateToken } from "../utils/generateToken";

let users: string[] = [];

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const state = googleState.setState();
    const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
    // Generate a url that asks permissions for the Drive activity and Google Calendar scope
    const authorizationUrl = googleAuthClient.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      /** Pass in the scopes array defined above.
       * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
      scope: scopes,
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true,
      // Include the state parameter to reduce the risk of CSRF attacks.
      state: state,
    });
    // Redirect the user to authorizationUrl
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error(error);
    res.end(error);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  console.info("googleCallback");
  // We exchange the authorization code for an access and ID token
  // by making a post request to Google’s access token endpoint
  const url = new URL(req.url, `http://${req.headers.host}`);
  let q = Object.fromEntries(url.searchParams.entries());
  if (q.error) {
    // An error response e.g. error=access_denied
    console.error("Error:" + q.error);
    res.end("Error:" + q.error);
    // Check state value
  } else if (!googleState.checkState(q.state)) {
    console.error("State mismatch. Possible CSRF attack");
    res.end("State mismatch. Possible CSRF attack");
  }

  let { tokens } = await googleAuthClient.getToken(q.code);

  // setCredentials(tokens) only stores the tokens in memory.
  // If your server restarts, they will be lost unless you persisted
  googleAuthClient.setCredentials(tokens);

  if (
    tokens.scope &&
    tokens.scope.includes(GOOGLE_OAUTH_SCOPES[0]) &&
    tokens.scope.includes(GOOGLE_OAUTH_SCOPES[1])
  ) {
    // Because we are communicating directly with a Google server,
    // We can be confident that the token is valid
    const { data } = await oauth2.userinfo.get();
    const { email, name } = data;

    // get user or create user
    let user = email && users.includes(email);
    if (email && !user) {
      users.push(email);
      console.log("users email array: ", users);
    }
    try {
      const token = email && name && generateToken({ email, name });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.redirect(LOGGED_IN_REACT_ADDRESS);
      return;
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ message: "Failed to generate token" });
      return;
    } finally {
      googleState.clearState();
    }
  }
};
