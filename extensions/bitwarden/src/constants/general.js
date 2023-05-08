"use strict";
/* Put constants that you feel like they still don't deserve a file of their own here */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_STORAGE_KEY = exports.SENSITIVE_VALUE_PLACEHOLDER = exports.DEFAULT_SERVER_URL = void 0;
exports.DEFAULT_SERVER_URL = "https://bitwarden.com";
exports.SENSITIVE_VALUE_PLACEHOLDER = "HIDDEN-VALUE";
exports.LOCAL_STORAGE_KEY = {
    PASSWORD_OPTIONS: "bw-generate-password-options",
    PASSWORD_ONE_TIME_WARNING: "bw-generate-password-warning-accepted",
    SESSION_TOKEN: "sessionToken",
    REPROMPT_HASH: "sessionRepromptHash",
    SERVER_URL: "cliServer",
    LAST_ACTIVITY_TIME: "lastActivityTime",
    VAULT_LOCK_REASON: "vaultLockReason",
};
