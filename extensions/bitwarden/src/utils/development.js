"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureException = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const api_1 = require("@raycast/api");
const captureException = (description, error) => {
    if (!api_1.environment.isDevelopment)
        return;
    console.error(description, error);
};
exports.captureException = captureException;
