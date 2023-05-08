"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bitwarden = void 0;
const api_1 = require("@raycast/api");
const execa_1 = require("execa");
const fs_1 = require("fs");
const posix_1 = require("path/posix");
const general_1 = require("~/constants/general");
const passwords_1 = require("~/utils/passwords");
const preferences_1 = require("~/utils/preferences");
const errors_1 = require("~/utils/errors");
class Bitwarden {
    constructor() {
        this.callbacks = {};
        const { cliPath, clientId, clientSecret, serverCertsPath } = (0, api_1.getPreferenceValues)();
        const serverUrl = (0, preferences_1.getServerUrlPreference)();
        this.cliPath = cliPath || (process.arch == "arm64" ? "/opt/homebrew/bin/bw" : "/usr/local/bin/bw");
        if (!(0, fs_1.existsSync)(this.cliPath)) {
            throw new errors_1.CLINotFoundError(`Bitwarden CLI not found at ${this.cliPath}`);
        }
        this.env = {
            BITWARDENCLI_APPDATA_DIR: api_1.environment.supportPath,
            BW_CLIENTSECRET: clientSecret.trim(),
            BW_CLIENTID: clientId.trim(),
            PATH: (0, posix_1.dirname)(process.execPath),
            ...(serverUrl && serverCertsPath ? { NODE_EXTRA_CA_CERTS: serverCertsPath } : {}),
        };
        this.initPromise = (async () => {
            await this.checkServerUrl(serverUrl);
            this.lockReason = await api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.VAULT_LOCK_REASON);
        })();
    }
    setActionCallback(action, callback) {
        this.callbacks[action] = callback;
        return this;
    }
    setSessionToken(token) {
        this.env = {
            ...this.env,
            BW_SESSION: token,
        };
    }
    clearSessionToken() {
        delete this.env.BW_SESSION;
    }
    withSession(token) {
        this.tempSessionToken = token;
        return this;
    }
    async initialize() {
        await this.initPromise;
        return this;
    }
    async checkServerUrl(serverUrl) {
        // Check the CLI has been configured to use the preference Url
        const cliServer = (await api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.SERVER_URL)) || "";
        if (cliServer === serverUrl)
            return;
        // Update the server Url
        const toast = await (0, api_1.showToast)({
            style: api_1.Toast.Style.Animated,
            title: "Switching server...",
            message: "Bitwarden server preference changed",
        });
        try {
            try {
                await this.logout();
            }
            catch {
                // It doesn't matter if we weren't logged in.
            }
            // If URL is empty, set it to the default
            await this.exec(["config", "server", serverUrl || general_1.DEFAULT_SERVER_URL]);
            await api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);
            toast.style = api_1.Toast.Style.Success;
            toast.title = "Success";
            toast.message = "Bitwarden server changed";
        }
        catch (error) {
            toast.style = api_1.Toast.Style.Failure;
            toast.title = "Failed to switch server";
            if (error instanceof Error) {
                toast.message = error.message;
            }
            else {
                toast.message = "Unknown error occurred";
            }
        }
    }
    async setLockReason(reason) {
        this.lockReason = reason;
        await api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.VAULT_LOCK_REASON, reason);
    }
    async clearLockReason() {
        if (this.lockReason) {
            await api_1.LocalStorage.removeItem(general_1.LOCAL_STORAGE_KEY.VAULT_LOCK_REASON);
            this.lockReason = undefined;
        }
    }
    async exec(args, options) {
        const { abortController, input = "", skipLastActivityUpdate = false } = options ?? {};
        let env = this.env;
        if (this.tempSessionToken)
            env = { ...env, BW_SESSION: this.tempSessionToken };
        const result = await (0, execa_1.execa)(this.cliPath, args, { env, input, signal: abortController?.signal });
        if (!skipLastActivityUpdate) {
            await api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, new Date().toISOString());
        }
        if (this.tempSessionToken) {
            this.tempSessionToken = undefined;
        }
        if (this.isPromptWaitingForMasterPassword(result)) {
            /* since we have the session token in the env, the password
            should not be requested, unless the vault is locked */
            await this.lock();
            throw new errors_1.VaultIsLockedError();
        }
        return result;
    }
    async sync() {
        await this.exec(["sync"]);
    }
    async login() {
        await this.exec(["login", "--apikey"]);
        await this.clearLockReason();
        await this.callbacks.login?.();
    }
    async logout() {
        await this.exec(["logout"]);
        this.clearSessionToken();
        await this.callbacks.logout?.();
    }
    async lock(reason, shouldCheckVaultStatus) {
        if (shouldCheckVaultStatus) {
            const isAuthenticated = (await this.status()).status !== "unauthenticated";
            if (!isAuthenticated)
                return;
        }
        if (reason)
            await this.setLockReason(reason);
        await this.exec(["lock"]);
        await this.callbacks.lock?.(reason);
    }
    async unlock(password) {
        const { stdout: sessionToken } = await this.exec(["unlock", password, "--raw"]);
        this.setSessionToken(sessionToken);
        await this.clearLockReason();
        await this.callbacks.unlock?.(password, sessionToken);
        return sessionToken;
    }
    async listItems() {
        const { stdout } = await this.exec(["list", "items"]);
        const items = JSON.parse(stdout);
        // Filter out items without a name property (they are not displayed in the bitwarden app)
        return items.filter((item) => !!item.name);
    }
    async listFolders() {
        const { stdout } = await this.exec(["list", "folders"]);
        return JSON.parse(stdout);
    }
    async getTotp(id) {
        // this could return something like "Not found." but checks for totp code are done before calling this function
        const { stdout } = await this.exec(["get", "totp", id]);
        return stdout;
    }
    async status() {
        const { stdout } = await this.exec(["status"]);
        return JSON.parse(stdout);
    }
    async checkLockStatus() {
        try {
            await this.exec(["unlock", "--check"]);
            return "unlocked";
        }
        catch (error) {
            const errorMessage = error.stderr;
            if (errorMessage === "Vault is locked.")
                return "locked";
            return "unauthenticated";
        }
    }
    async generatePassword(options, abortController) {
        const args = options ? (0, passwords_1.getPasswordGeneratingArgs)(options) : [];
        const { stdout } = await this.exec(["generate", ...args], { abortController });
        return stdout;
    }
    isPromptWaitingForMasterPassword(result) {
        return !!(result.stderr && result.stderr.includes("Master password"));
    }
}
exports.Bitwarden = Bitwarden;
