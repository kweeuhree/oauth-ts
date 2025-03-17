import { describe, expect, test } from "@jest/globals";
import { generateToken } from "../../src/utils/generateToken.ts";

const mockUsers = {
  validUser: {
    email: "foo@bar.dev",
    name: "Foo",
  },
  invalidUser: {
    missingEmail: {
      email: "",
      name: "Foo",
    },
    missingName: {
      email: "foo@bar.dev",
      name: "",
    },
  },
};

describe("generateToken", () => {
  test("generates a JWT token", () => {
    mockUsers.validUser.array.forEach((obj) => {
      const result = generateToken(obj);
      expect(result).not.toBe("");
    });
  });
  test("throws error with partial input", () => {
    mockUsers.invalidUser.array.forEach((obj) => {
      const result = generateToken(obj);
      expect(result).toBe("");
    });
  });
});
