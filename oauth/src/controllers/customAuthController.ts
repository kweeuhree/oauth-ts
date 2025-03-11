import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

// TODO use gapi library

let users: string[] = [];

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_OAUTH_STATE = process.env.GOOGLE_OAUTH_STATE;

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

const GOOGLE_CALLBACK_URL = "http%3A//localhost:8000/google/callback";
const GOOGLE_OAUTH_SCOPES = [
  "https%3A//www.googleapis.com/auth/userinfo.email",
  "https%3A//www.googleapis.com/auth/userinfo.profile",
];

//
// You must include the Google Platform Library on your web pages that integrate Google Sign-In.
// <script src="https://apis.google.com/js/platform.js" async defer></script>

// Add a Google Sign-In button
// <div class="g-signin2" data-onsuccess="onSignIn"></div>

export const signup = async (req: Request, res: Response) => {
  console.info("signup");

  // state should include the value of the anti-forgery unique session token,
  // it has to be a unique, per-request token in order to be able to protect from CSRF attacks.
  const state = GOOGLE_OAUTH_STATE;
  // scope=openid%20email&
  // const scope = GOOGLE_OAUTH_SCOPES.join(" ");
  const scope = "openid%20email&20profile";
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scope}`;
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
};

export const googleCallback = async (req: Request, res: Response) => {
  console.info("googleCallback");
  console.log(req.query);

  // We exchange the authorization code for an access and ID token
  // by making a post request to Google’s access token endpoint
  const { code } = req.query;

  if (typeof code !== "string") {
    console.error("received code parameter is not a string");
    res.status(500).json({ message: "Failed to validate Google OAuth code" });
  }

  const data = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: "http%3A//localhost:8000/google/callback",
    grant_type: "authorization_code",
  };

  // Exchange authorization code for access token
  const response = await fetch(String(GOOGLE_ACCESS_TOKEN_URL), {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    console.log(
      "failed to exchange authorization code for access token",
      response.status
    );
    res.status(response.status).json({ message: "Failed to verify token" });
    return;
  }
  // Extract ID token from the response, ID token verifies user identity
  const accessTokenData = await response.json();
  const { id_token } = accessTokenData;
  console.log("id token: ", id_token);

  // Verify and extract the information in the ID token
  const tokenInfoResponse = await fetch(
    `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
  );
  if (!tokenInfoResponse.ok) {
    console.log("tokenInfoResponse.status", tokenInfoResponse.status);
    res
      .status(tokenInfoResponse.status)
      .json({ message: "Failed to verify token" });
    return;
  }
  const tokenInfo = await tokenInfoResponse.json();

  // get user or create user
  const { email, name } = tokenInfo;
  console.log("token info", tokenInfo);
  let user = users.includes(email);
  if (!user) {
    users.push(email);
    console.log("users email array: ", users);
  }
  try {
    const token = await generateToken({ email, name });
    console.log("token: ", token);
    console.log("tokenInfoResponse.status", tokenInfoResponse.status);
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
    });
    res
      .status(tokenInfoResponse.status)
      .json({ message: `${email} successfully logged in` });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ message: "Failed to generate token" });
    return;
  }
};

const generateToken = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: Number(process.env.JWT_LIFETIME),
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

export const login = async (req: Request, res: Response) => {
  console.info("login\tauthing");
  res.send("hello logged in world");
};
