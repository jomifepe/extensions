"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLabelForTimeoutPreference = exports.getTransientCopyPreference = exports.getServerUrlPreference = void 0;
const api_1 = require("@raycast/api");
const preferences_1 = require("~/constants/preferences");
function getServerUrlPreference() {
    const { serverUrl } = (0, api_1.getPreferenceValues)();
    if (serverUrl === "" || serverUrl === "bitwarden.com" || serverUrl === "https://bitwarden.com") {
        return "";
    }
    return serverUrl;
}
exports.getServerUrlPreference = getServerUrlPreference;
const COMMAND_NAME_TO_PREFERENCE_KEY_MAP = {
    search: "transientCopySearch",
    "generate-password": "transientCopyGeneratePassword",
    "generate-password-quick": "transientCopyGeneratePasswordQuick",
};
function getTransientCopyPreference(type) {
    const preferenceKey = COMMAND_NAME_TO_PREFERENCE_KEY_MAP[api_1.environment.commandName];
    const transientPreference = (0, api_1.getPreferenceValues)()[preferenceKey];
    if (transientPreference === "never")
        return false;
    if (transientPreference === "always")
        return true;
    if (transientPreference === "passwords")
        return type === "password";
    return true;
}
exports.getTransientCopyPreference = getTransientCopyPreference;
function getLabelForTimeoutPreference(timeout) {
    return preferences_1.VAULT_TIMEOUT_MS_TO_LABEL[timeout];
}
exports.getLabelForTimeoutPreference = getLabelForTimeoutPreference;
