"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const bitwarden_1 = require("~/api/bitwarden");
const development_1 = require("~/utils/development");
const passwords_1 = require("~/utils/passwords");
const preferences_1 = require("~/utils/preferences");
const { generatePasswordQuickAction } = (0, api_1.getPreferenceValues)();
const actions = {
    copy: async (password) => {
        await api_1.Clipboard.copy(password, { transient: (0, preferences_1.getTransientCopyPreference)("password") });
        await (0, api_1.closeMainWindow)();
        await (0, api_1.showHUD)("Copied password to clipboard");
    },
    paste: async (password) => {
        await api_1.Clipboard.paste(password);
    },
    copyAndPaste: async (password) => {
        await api_1.Clipboard.paste(password);
        await api_1.Clipboard.copy(password, { transient: (0, preferences_1.getTransientCopyPreference)("password") });
        await (0, api_1.showHUD)("Copied password to clipboard");
    },
};
async function generatePasswordQuickCommand() {
    const toast = await (0, api_1.showToast)(api_1.Toast.Style.Animated, "Generating password…");
    try {
        const bitwarden = await new bitwarden_1.Bitwarden().initialize();
        const options = await (0, passwords_1.getPasswordGeneratorOptions)();
        const password = await bitwarden.generatePassword(options);
        await actions[generatePasswordQuickAction](password);
    }
    catch (error) {
        toast.style = api_1.Toast.Style.Failure;
        toast.message = "Failed to generate";
        (0, development_1.captureException)("Failed to generate password", error);
    }
}
exports.default = generatePasswordQuickCommand;
