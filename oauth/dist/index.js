"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv").config();
const routes_1 = require("./routes/routes");
const index_1 = require("./middleware/index");
const appLogger_1 = require("./appLogger");
const app = (0, express_1.default)();
const portEnv = process.env.PORT;
const PORT = (portEnv && parseInt(portEnv)) || 8080;
// Middlwares
app.use(index_1.loggerMiddleware);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use(routes_1.router);
// Error handling middlware
app.use(index_1.errorHandlerMiddleware);
const server = app.listen(PORT, "0.0.0.0", (error) => {
    if (error) {
        throw error;
    }
    (0, appLogger_1.log)(`Listening on ${PORT}`);
});
