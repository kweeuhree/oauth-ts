import jwt, { SignOptions } from "jsonwebtoken";

import { GOOGLE_CLIENT_ID } from "../config/index.js";

export const generateToken = ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
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
