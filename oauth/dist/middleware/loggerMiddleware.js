"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = exports.loggerMiddleware = void 0;
// loggerMiddleware() logs a request with the timestamp,
// specifying method and body of the request
const loggerMiddleware = (req, res, next) => {
    const logDetails = {
        timestamp: new Date().toLocaleString(),
        method: req.method,
        body: req.body,
    };
    // Log the details with INFO prefix
    console.info("INFO\t", logDetails);
    next();
};
exports.loggerMiddleware = loggerMiddleware;
// errorHandlerMiddleware() logs a error with a timestamp,
// and sends Internal Server Error error to the user
const errorHandlerMiddleware = (err, req, res, next) => {
    const errDetails = {
        timestamp: new Date().toLocaleString(),
        err,
    };
    // Log the details with ERROR prefix
    console.error("ERROR\t", errDetails);
    res.status(500).json({ error: "Internal Server Error" });
    next();
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
