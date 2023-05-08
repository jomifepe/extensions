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
const preferences_1 = require("~/utils/preferences");
const strings_1 = require("~/utils/strings");
function ShowSecureNoteAction() {
    const { push } = (0, api_1.useNavigation)();
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    if (!selectedItem.notes)
        return null;
    const showSecureNote = async () => {
        try {
            const notes = await getUpdatedVaultItem(selectedItem, (item) => item.notes, "Getting secure note...");
            if (notes) {
                push((0, jsx_runtime_1.jsx)(api_1.Detail, { markdown: (0, strings_1.codeBlock)(notes), actions: (0, jsx_runtime_1.jsx)(api_1.ActionPanel, { children: (0, jsx_runtime_1.jsx)(api_1.Action.CopyToClipboard, { title: "Copy Secure Note", content: notes, transient: (0, preferences_1.getTransientCopyPreference)("other") }) }) }));
            }
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to get secure note");
            (0, development_1.captureException)("Failed to show secure note", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ActionWithReprompt_1.default, { title: "Show Secure Note", icon: api_1.Icon.BlankDocument, onAction: showSecureNote, repromptDescription: `Showing the note of <${selectedItem.name}>` }));
}
exports.default = ShowSecureNoteAction;
