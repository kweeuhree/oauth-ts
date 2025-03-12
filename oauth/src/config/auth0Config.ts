const secret = process.env.AUTH0_SECRET;
const baseURL = "http://localhost:8000/api";
const clientID = process.env.CLIENT_ID;
const issuerBaseURL = process.env.ISSUER_BASE_URL;

export const config = {
  authRequired: false,
  auth0Logout: true,
  secret,
  baseURL,
  clientID,
  issuerBaseURL,
};
