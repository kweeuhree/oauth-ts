"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const log = (message) => {
    console.info(`INFO\t${new Date().toLocaleString()}\t${message}`);
};
exports.log = log;
