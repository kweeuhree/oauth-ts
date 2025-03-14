import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import {
  GITHUB_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_REDIRECT_URL,
} from "../config/githubConfig.js";
import { extractCode } from "../utils/index.js";
import { Octokit } from "octokit";

class GitHubAPIError extends Error {
  constructor(message: string) {
    // Call the constructor of the base class `Error`
    // And set the error name to the custom error class name
    super(message);
    this.name = "GitHubAPIError";
    // Set the prototype explicitly to maintain the correct prototype chain
    Object.setPrototypeOf(this, GitHubAPIError.prototype);
  }
}

class GitHubAuth {
  private auth;
  private scope: string[] = ["user:email"];
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

  authenticate = async (req: any) => {
    try {
      // Extract authorization code that will be exchanged for user tokens
      const code = extractCode(req, req.session.githubAuthState);
      // Because we are communicating directly with a GitHub server,
      // We can be confident that the token is valid
      const access_token = await this.getAccessToken(String(code));
      if (!access_token) {
        throw new GitHubAPIError("failed to obtain access token");
      }
      req.session.token = access_token;
      const user = await this.getUserInfo(access_token);
      return user;
    } catch (error) {
      console.error(error);
      throw new GitHubAPIError(
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  getAccessToken = async (code: string) => {
    try {
      const { token } = await this.auth({
        type: "oauth-user",
        code: String(code),
      });
      if (!token) {
        throw new GitHubAPIError("failed to exchange code for token");
      }
      return token;
    } catch (error) {
      throw new GitHubAPIError(
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  getUserInfo = async (token: string) => {
    try {
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const name = user.name;
      const { data: emails } =
        await octokit.rest.users.listEmailsForAuthenticatedUser();
      const email = emails.map((obj) => {
        if (obj.primary) {
          return obj.email;
        }
        return;
      })[0];
      if (name && email) {
        return { name, email };
      }
      return;
    } catch (error) {
      throw new GitHubAPIError(
        error instanceof Error ? error.message : String(error)
      );
    }
  };
}

export const githubAuth = new GitHubAuth(
  String(GITHUB_CLIENT_ID),
  String(GITHUB_CLIENT_SECRET),
  GITHUB_REDIRECT_URL
);
