"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPasswordGeneratorOptions = exports.hashMasterPasswordForReprompting = exports.getPasswordGeneratingArgs = void 0;
const api_1 = require("@raycast/api");
const crypto_1 = require("crypto");
const general_1 = require("~/constants/general");
const passwords_1 = require("~/constants/passwords");
function getPasswordGeneratingArgs(options) {
    return Object.entries(options).flatMap(([arg, value]) => (value ? [`--${arg}`, value] : []));
}
exports.getPasswordGeneratingArgs = getPasswordGeneratingArgs;
async function hashMasterPasswordForReprompting(password) {
    return new Promise((resolve, reject) => {
        (0, crypto_1.pbkdf2)(password, passwords_1.REPROMPT_HASH_SALT, 100000, 64, "sha512", (error, hashed) => {
            if (error != null) {
                reject(error);
                return;
            }
            resolve(hashed.toString("hex"));
        });
    });
}
exports.hashMasterPasswordForReprompting = hashMasterPasswordForReprompting;
async function getPasswordGeneratorOptions() {
    const storedOptions = await api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.PASSWORD_OPTIONS);
    return {
        ...passwords_1.DEFAULT_PASSWORD_OPTIONS,
        ...(storedOptions ? JSON.parse(storedOptions) : {}),
    };
}
exports.getPasswordGeneratorOptions = getPasswordGeneratorOptions;
