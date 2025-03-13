import { randomBytes } from "node:crypto";

class GoogleState {
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

// Store google state in the google state class
export const googleState = new GoogleState();
