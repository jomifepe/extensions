"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const useGetUpdatedVaultItem_1 = __importDefault(require("~/components/searchVault/utils/useGetUpdatedVaultItem"));
const development_1 = require("~/utils/development");
const preferences_1 = require("~/utils/preferences");
function CopyUsernameAction() {
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    if (!selectedItem.login?.username)
        return null;
    const handleCopyUsername = async () => {
        try {
            const username = await getUpdatedVaultItem(selectedItem, (item) => item.login?.username, "Getting username...");
            if (username) {
                await api_1.Clipboard.copy(username, { transient: (0, preferences_1.getTransientCopyPreference)("other") });
                await (0, api_1.showHUD)("Copied to clipboard");
            }
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to get username");
            (0, development_1.captureException)("Failed to copy username", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(api_1.Action, { title: "Copy Username", icon: api_1.Icon.Person, onAction: handleCopyUsername, shortcut: { modifiers: ["cmd"], key: "u" } }));
}
exports.default = CopyUsernameAction;
