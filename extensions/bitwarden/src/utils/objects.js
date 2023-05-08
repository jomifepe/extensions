"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.objectEntries = void 0;
/** `Object.entries` with typed keys */
function objectEntries(obj) {
    return Object.entries(obj);
}
exports.objectEntries = objectEntries;
function isObject(obj) {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
exports.isObject = isObject;
