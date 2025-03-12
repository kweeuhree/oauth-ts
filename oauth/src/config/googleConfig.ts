import { google } from "googleapis";

export const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_OAUTH_STATE = process.env.GOOGLE_OAUTH_STATE;

export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

export const GOOGLE_CALLBACK_URL = "http://localhost:8000/google-callback";
export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// You must include the Google Platform Library on your web pages that integrate Google Sign-In.
// <script src="https://apis.google.com/js/platform.js" async defer></script>

// Add a Google Sign-In button
// <div class="g-signin2" data-onsuccess="onSignIn"></div>

//
// An error response:
// https://oauth2.example.com/auth?error=access_denied

const initializeGoogleAuth = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
  );
};

export const googleAuth = initializeGoogleAuth();
