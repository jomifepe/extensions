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
function OpenUrlInBrowserAction() {
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    if (!getUri(selectedItem))
        return null;
    const handleOpenUrlInBrowser = async () => {
        try {
            const mainUri = await getUpdatedVaultItem(selectedItem, getUri, "Getting URL...");
            if (mainUri)
                await (0, api_1.open)(mainUri);
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to get URL");
            (0, development_1.captureException)("Failed to open URL in browser", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(api_1.Action, { title: "Open in Browser", onAction: handleOpenUrlInBrowser, icon: api_1.Icon.Globe, shortcut: { modifiers: ["cmd"], key: "o" } }));
}
function getUri(item) {
    return item.login?.uris?.[0]?.uri;
}
exports.default = OpenUrlInBrowserAction;
