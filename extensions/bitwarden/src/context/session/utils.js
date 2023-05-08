"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedSession = exports.Storage = void 0;
const api_1 = require("@raycast/api");
const general_1 = require("~/constants/general");
const preferences_1 = require("~/constants/preferences");
exports.Storage = {
    getSavedSession: () => {
        return Promise.all([
            api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.SESSION_TOKEN),
            api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.REPROMPT_HASH),
            api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME),
        ]);
    },
    clearSession: () => {
        return Promise.all([
            api_1.LocalStorage.removeItem(general_1.LOCAL_STORAGE_KEY.SESSION_TOKEN),
            api_1.LocalStorage.removeItem(general_1.LOCAL_STORAGE_KEY.REPROMPT_HASH),
        ]);
    },
    saveSession: (token, passwordHash) => {
        return Promise.all([
            api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.SESSION_TOKEN, token),
            api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.REPROMPT_HASH, passwordHash),
        ]);
    },
};
const VAULT_TIMEOUT_MESSAGE = "Vault timed out due to inactivity";
async function getSavedSession() {
    const [token, passwordHash, lastActivityTimeString] = await exports.Storage.getSavedSession();
    if (!token || !passwordHash)
        return { shouldLockVault: true };
    const loadedState = { token, passwordHash };
    if (!lastActivityTimeString)
        return { ...loadedState, shouldLockVault: false };
    const lastActivityTime = new Date(lastActivityTimeString);
    loadedState.lastActivityTime = lastActivityTime;
    const vaultTimeoutMs = +(0, api_1.getPreferenceValues)().repromptIgnoreDuration;
    if (vaultTimeoutMs === preferences_1.VAULT_TIMEOUT.NEVER)
        return { ...loadedState, shouldLockVault: false };
    const timeElapseSinceLastPasswordEnter = Date.now() - lastActivityTime.getTime();
    if (vaultTimeoutMs === preferences_1.VAULT_TIMEOUT.IMMEDIATELY || timeElapseSinceLastPasswordEnter >= vaultTimeoutMs) {
        return { ...loadedState, shouldLockVault: true, lockReason: VAULT_TIMEOUT_MESSAGE };
    }
    return { ...loadedState, shouldLockVault: false };
}
exports.getSavedSession = getSavedSession;
