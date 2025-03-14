import { Request, Response, NextFunction } from "express";

// loggerMiddleware() logs a request with the timestamp,
// specifying method and body of the request
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logDetails = {
    timestamp: new Date().toLocaleString(),
    method: req.method,
    body: req.body,
  };

  // Log the details with INFO prefix
  console.info("INFO\t", logDetails);
  console.log(res);
  next();
};

// errorHandlerMiddleware() logs a error with a timestamp,
// and sends Internal Server Error error to the user
export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errDetails = {
    timestamp: new Date().toLocaleString(),
    err,
  };

  // Log the details with ERROR prefix
  console.error("ERROR\t", errDetails);
  console.log(req);
  res.status(500).json({ error: "Internal Server Error" });
  next();
};
