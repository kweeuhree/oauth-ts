import { Request, Response } from "express";
import { google } from "googleapis";

import { randomBytes } from "node:crypto";
import { URL } from "node:url";
import jwt, { SignOptions } from "jsonwebtoken";

import { LOGGED_IN_REACT_ADDRESS } from "../config/reactRedirectAddress";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_OAUTH_SCOPES,
  googleAuthClient,
  oauth2,
} from "../config/googleConfig";

let users: string[] = [];

class State {
  // state should include the value of the anti-forgery unique session token,
  // it has to be a unique, per-request token in order to be able to protect from CSRF attacks.
  // Generate a secure random state value.
  private currentState: string = "";

  newState = (): string => {
    return randomBytes(32).toString("hex");
  };

  checkState = (hex: string) => {
    return hex === this.currentState;
  };

  setState = () => {
    this.currentState = this.newState();
    return this.currentState;
  };

  clearState = () => {
    this.currentState = "";
  };
}

const stateStore = new State();

export const googleSignIn = async (req: Request, res: Response) => {
  console.info("signup");

  // Store state in the session
  const state = stateStore.setState();

  // scope=openid%20email&
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
  // const scopes = "openid%20email&20profile";
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
};

// An error response:
// https://oauth2.example.com/auth?error=access_denied

export const googleCallback = async (req: Request, res: Response) => {
  console.info("googleCallback");
  console.log(req.query);

  // We exchange the authorization code for an access and ID token
  // by making a post request to Google’s access token endpoint
  const url = new URL(req.url, `http://${req.headers.host}`);
  let q = Object.fromEntries(url.searchParams.entries());
  if (q.error) {
    // An error response e.g. error=access_denied
    console.log("Error:" + q.error);
  } else if (!stateStore.checkState(q.state)) {
    //check state value
    console.error("State mismatch. Possible CSRF attack");
    res.end("State mismatch. Possible CSRF attack");
  } else {
    // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await googleAuthClient.getToken(q.code);

    // setCredentials(tokens) only stores the tokens in memory.
    // If your server restarts, they will be lost unless you persisted
    googleAuthClient.setCredentials(tokens);

    console.log("token info", tokens);
    if (
      tokens.scope &&
      tokens.scope.includes(GOOGLE_OAUTH_SCOPES[0]) &&
      tokens.scope.includes(GOOGLE_OAUTH_SCOPES[1])
    ) {
      // Because we are communicating directly with a Google server,
      // We can be confident that the token is valid
      const { data } = await oauth2.userinfo.get();
      const { email, name } = data;
      console.log("token info", data);
      // get user or create user
      let user = email && users.includes(email);
      if (email && !user) {
        users.push(email);
        console.log("users email array: ", users);
      }
      try {
        const token = email && name && generateToken({ email, name });
        console.log("token: ", token);
        // console.log("tokenInfoResponse.status", tokenInfoResponse.status);
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
      }
    }
  }

  stateStore.clearState();

  // get user or create user
  // const { email, name } = tokens;

  // let user = users.includes(email);
  // if (!user) {
  //   users.push(email);
  //   console.log("users email array: ", users);
  // }
  // try {
  //   const token = await generateToken({ email, name });
  //   console.log("token: ", token);
  //   console.log("tokenInfoResponse.status", tokenInfoResponse.status);
  //   res.cookie("token", token, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: "lax",
  //   });
  //   res
  //     .status(tokenInfoResponse.status)
  //     .json({ message: `${email} successfully logged in` })
  //     .redirect(LOGGED_IN_REACT_ADDRESS);
  // } catch (error) {
  //   console.error("Error generating token:", error);
  //   res.status(500).json({ message: "Failed to generate token" });
  //   return;
  // }
};

const generateToken = ({ email, name }: { email: string; name: string }) => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: "1d",
    issuer: "AIHelper",
    audience: GOOGLE_CLIENT_ID,
  };
  console.log(options);
  const token = jwt.sign(
    { id: email, username: name },
    String(process.env.JWT_SECRET),
    options
  );
  return token;
};

// export const googleSignIn = async (req: Request, res: Response) => {
//   console.info("signup");

//   // state should include the value of the anti-forgery unique session token,
//   // it has to be a unique, per-request token in order to be able to protect from CSRF attacks.
//   const state = GOOGLE_OAUTH_STATE;
//   // scope=openid%20email&
//   // const scope = GOOGLE_OAUTH_SCOPES.join(" ");
//   const scope = "openid%20email&20profile";
//   const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scope}`;
//   res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
// };

// export const googleCallback = async (req: Request, res: Response) => {
//   console.info("googleCallback");
//   console.log(req.query);

//   // We exchange the authorization code for an access and ID token
//   // by making a post request to Google’s access token endpoint
//   const { code } = req.query;

//   if (typeof code !== "string") {
//     console.error("received code parameter is not a string");
//     res.status(500).json({ message: "Failed to validate Google OAuth code" });
//   }

//   const data = {
//     code,
//     client_id: GOOGLE_CLIENT_ID,
//     client_secret: GOOGLE_CLIENT_SECRET,
//     redirect_uri: "http%3A//localhost:8000/google/callback",
//     grant_type: "authorization_code",
//   };

//   // Exchange authorization code for access token
//   const response = await fetch(String(GOOGLE_ACCESS_TOKEN_URL), {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) {
//     console.log(
//       "failed to exchange authorization code for access token",
//       response.status
//     );
//     res.status(response.status).json({ message: "Failed to verify token" });
//     return;
//   }
//   // Extract ID token from the response, ID token verifies user identity
//   const accessTokenData = await response.json();
//   const { id_token } = accessTokenData;
//   console.log("id token: ", id_token);

//   // Verify and extract the information in the ID token
//   const tokenInfoResponse = await fetch(
//     `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
//   );
//   if (!tokenInfoResponse.ok) {
//     console.log("tokenInfoResponse.status", tokenInfoResponse.status);
//     res
//       .status(tokenInfoResponse.status)
//       .json({ message: "Failed to verify token" });
//     return;
//   }
//   const tokenInfo = await tokenInfoResponse.json();

//   // get user or create user
//   const { email, name } = tokenInfo;
//   console.log("token info", tokenInfo);
//   let user = users.includes(email);
//   if (!user) {
//     users.push(email);
//     console.log("users email array: ", users);
//   }
//   try {
//     const token = await generateToken({ email, name });
//     console.log("token: ", token);
//     console.log("tokenInfoResponse.status", tokenInfoResponse.status);
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "lax",
//     });
//     res
//       .status(tokenInfoResponse.status)
//       .json({ message: `${email} successfully logged in` })
//       .redirect(LOGGED_IN_REACT_ADDRESS);
//   } catch (error) {
//     console.error("Error generating token:", error);
//     res.status(500).json({ message: "Failed to generate token" });
//     return;
//   }
// };

// const generateToken = async ({
//   email,
//   name,
// }: {
//   email: string;
//   name: string;
// }) => {
//   const options: SignOptions = {
//     algorithm: "HS256",
//     expiresIn: Number(process.env.JWT_LIFETIME),
//     issuer: "AIHelper",
//     audience: GOOGLE_CLIENT_ID,
//   };
//   console.log(options);
//   const token = jwt.sign(
//     { id: email, username: name },
//     String(process.env.JWT_SECRET),
//     options
//   );
//   return token;
// };
