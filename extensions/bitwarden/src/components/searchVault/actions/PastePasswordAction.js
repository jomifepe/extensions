"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const ActionWithReprompt_1 = __importDefault(require("~/components/actions/ActionWithReprompt"));
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const useGetUpdatedVaultItem_1 = __importDefault(require("~/components/searchVault/utils/useGetUpdatedVaultItem"));
const development_1 = require("~/utils/development");
function PastePasswordAction() {
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    if (!selectedItem.login?.password)
        return null;
    const pastePassword = async () => {
        try {
            const password = await getUpdatedVaultItem(selectedItem, (item) => item.login?.password, "Getting password...");
            if (password)
                await api_1.Clipboard.paste(password);
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to get password");
            (0, development_1.captureException)("Failed to paste password", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ActionWithReprompt_1.default, { title: "Paste Password", icon: api_1.Icon.Key, onAction: pastePassword, repromptDescription: `Pasting the password of <${selectedItem.name}>` }));
}
exports.default = PastePasswordAction;
