import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  console.info("userGetter\tgetting");
  res.send("getter");
};
