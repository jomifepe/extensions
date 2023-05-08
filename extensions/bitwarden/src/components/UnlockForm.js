"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const bitwarden_1 = require("~/context/bitwarden");
const debug_1 = require("~/utils/debug");
const development_1 = require("~/utils/development");
const useVaultMessages_1 = __importDefault(require("~/utils/hooks/useVaultMessages"));
const preferences_1 = require("~/utils/preferences");
/** Form for unlocking or logging in to the Bitwarden vault. */
const UnlockForm = (props) => {
    const { lockReason: lockReasonProp } = props;
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const [isLoading, setLoading] = (0, react_1.useState)(false);
    const { userMessage, serverMessage, shouldShowServer } = (0, useVaultMessages_1.default)();
    const lockReason = (0, react_1.useRef)(lockReasonProp ?? bitwarden.lockReason).current;
    const [unlockError, setUnlockError] = (0, react_1.useState)(undefined);
    async function onSubmit({ password }) {
        if (password.length === 0)
            return;
        const toast = await (0, api_1.showToast)(api_1.Toast.Style.Animated, "Unlocking Vault...", "Please wait");
        try {
            setLoading(true);
            setUnlockError(undefined);
            const state = await bitwarden.status();
            if (state.status === "unauthenticated") {
                try {
                    await bitwarden.login();
                }
                catch (error) {
                    const { displayableError = `Please check your ${shouldShowServer ? "Server URL, " : ""}API Key and Secret.`, treatedError, } = getUsefulError(error, password);
                    await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to log in", displayableError);
                    setUnlockError(treatedError);
                    (0, development_1.captureException)("Failed to log in", error);
                    return;
                }
            }
            await bitwarden.unlock(password);
            await toast.hide();
        }
        catch (error) {
            const { displayableError = "Please check your credentials", treatedError } = getUsefulError(error, password);
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to unlock vault", displayableError);
            setUnlockError(treatedError);
            (0, development_1.captureException)("Failed to unlock vault", error);
        }
        finally {
            setLoading(false);
        }
    }
    const copyUnlockError = async () => {
        if (!unlockError)
            return;
        await api_1.Clipboard.copy(unlockError);
        await (0, api_1.showToast)(api_1.Toast.Style.Success, "Error copied to clipboard");
    };
    return ((0, jsx_runtime_1.jsxs)(api_1.Form, { actions: (0, jsx_runtime_1.jsxs)(api_1.ActionPanel, { children: [!isLoading && ((0, jsx_runtime_1.jsx)(api_1.Action.SubmitForm, { icon: api_1.Icon.LockUnlocked, title: "Unlock", onSubmit: onSubmit, shortcut: { key: "enter", modifiers: [] } })), !!unlockError && ((0, jsx_runtime_1.jsx)(api_1.Action, { onAction: copyUnlockError, title: "Copy Last Error", icon: api_1.Icon.Bug, style: api_1.Action.Style.Destructive }))] }), children: [shouldShowServer && (0, jsx_runtime_1.jsx)(api_1.Form.Description, { title: "Server URL", text: serverMessage }), (0, jsx_runtime_1.jsx)(api_1.Form.Description, { title: "Vault Status", text: userMessage }), (0, jsx_runtime_1.jsx)(api_1.Form.PasswordField, { autoFocus: true, id: "password", title: "Master Password" }), !!lockReason && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(api_1.Form.Description, { title: "\u2139\uFE0F", text: lockReason }), (0, jsx_runtime_1.jsx)(TimeoutInfoDescription, {})] }))] }));
};
function TimeoutInfoDescription() {
    const vaultTimeoutMs = (0, api_1.getPreferenceValues)().repromptIgnoreDuration;
    const timeoutLabel = (0, preferences_1.getLabelForTimeoutPreference)(vaultTimeoutMs);
    if (!timeoutLabel)
        return null;
    return ((0, jsx_runtime_1.jsx)(api_1.Form.Description, { title: "", text: `Timeout is set to ${timeoutLabel}, this can be configured in the extension settings` }));
}
function getUsefulError(error, password) {
    const treatedError = (0, debug_1.treatError)(error, { omitSensitiveValue: password });
    let displayableError;
    if (/Invalid master password/i.test(treatedError)) {
        displayableError = "Invalid master password";
    }
    else if (/Invalid API Key/i.test(treatedError)) {
        displayableError = "Invalid Client ID or Secret";
    }
    return { displayableError, treatedError };
}
exports.default = UnlockForm;
