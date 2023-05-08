"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const ActionWithReprompt_1 = __importDefault(require("~/components/actions/ActionWithReprompt"));
const bitwarden_1 = require("~/context/bitwarden");
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const preferences_1 = require("~/utils/preferences");
const useGetUpdatedVaultItem_1 = __importDefault(require("~/components/searchVault/utils/useGetUpdatedVaultItem"));
const development_1 = require("~/utils/development");
function CopyTotpAction() {
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    if (!selectedItem.login?.totp)
        return null;
    const copyTotp = async () => {
        const toast = await (0, api_1.showToast)(api_1.Toast.Style.Animated, "Getting TOTP code...");
        try {
            const id = await getUpdatedVaultItem(selectedItem, (item) => item.id);
            const totp = await bitwarden.getTotp(id);
            await toast?.hide();
            await api_1.Clipboard.copy(totp, { transient: (0, preferences_1.getTransientCopyPreference)("other") });
            await (0, api_1.showHUD)("Copied to clipboard");
            await (0, api_1.closeMainWindow)({ clearRootSearch: true });
        }
        catch (error) {
            toast.message = "Failed to get TOTP";
            toast.style = api_1.Toast.Style.Failure;
            (0, development_1.captureException)("Failed to copy TOTP", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ActionWithReprompt_1.default, { title: "Copy TOTP", icon: api_1.Icon.Clipboard, onAction: copyTotp, shortcut: { modifiers: ["cmd"], key: "t" }, repromptDescription: `Copying the TOTP of <${selectedItem.name}>` }));
}
exports.default = CopyTotpAction;
