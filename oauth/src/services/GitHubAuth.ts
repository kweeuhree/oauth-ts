import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import {
  GITHUB_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_TOKEN_INFO_URL,
  GITHUB_REDIRECT_URL,
} from "../config/githubConfig.js";
import { extractCode } from "../utils/index.js";

class GitHubAuth {
  private auth;
  private scope: string[] = ["user"];
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUrl: string
  ) {
    // Initialize the OAuth2 client for Google authentication
    // This handles sign-in, token exchange, and token refreshing
    this.auth = createOAuthAppAuth({
      clientId,
      clientSecret,
    });
  }

  generateAuthUrl = (state: string) => {
    return `${this.redirectUrl}client_id=${this.clientId}&scope=${this.scope}&state=${state}`;
  };

  authenticate = async (req: any): Promise<boolean> => {
    try {
      // Extract authorization code that will be exchanged for user tokens
      const code = extractCode(req, req.session.githubAuthState);
      // Because we are communicating directly with a Google server,
      // We can be confident that the token is valid
      const access_token = await this.getAccessToken(String(code));
      if (access_token) {
        req.session.token = access_token;
        const user = await this.getUserInfo(access_token);
        console.log("user object what to send back");
        console.log(user);
        return true;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }

    return false;
  };

  getAccessToken = async (code: string) => {
    const { token } = await this.auth({
      type: "oauth-user",
      code: String(code),
    });
    return token;
  };

  getUserInfo = async (token: string) => {
    const request = await fetch(String(GITHUB_TOKEN_INFO_URL), {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    if (request.ok) {
      return await request.json();
    }
  };
}

export const githubAuth = new GitHubAuth(
  String(GITHUB_CLIENT_ID),
  String(GITHUB_CLIENT_SECRET),
  GITHUB_REDIRECT_URL
);
