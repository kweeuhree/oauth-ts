import { Request, Response } from "express";
import { LOGGED_IN_REACT_ADDRESS } from "../constants";

let users: string[] = [];

export const signup = async (req: Request, res: Response) => {
  console.info("signup");
};

export const auth0callback = async (req: Request, res: Response) => {
  console.info("auth0 callback");
  res.redirect(LOGGED_IN_REACT_ADDRESS);
};

export const login = async (req: Request, res: Response) => {
  console.info("login\tauthing");
  res.send("hello logged in world");
};
