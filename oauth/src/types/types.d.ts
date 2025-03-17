// this type declaration extends default express-session types
import { Session } from "express-session";

export interface GSession extends Session {
  googleAuthState: string;
  githubAuthState: string;
  token: string;
}
