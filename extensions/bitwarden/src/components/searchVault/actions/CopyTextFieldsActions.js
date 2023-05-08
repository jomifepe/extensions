"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const strings_1 = require("~/utils/strings");
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const ActionWithReprompt_1 = __importDefault(require("~/components/actions/ActionWithReprompt"));
const preferences_1 = require("~/utils/preferences");
const useGetUpdatedVaultItem_1 = __importDefault(require("~/components/searchVault/utils/useGetUpdatedVaultItem"));
const development_1 = require("~/utils/development");
function CopyTextFieldsActions() {
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    const uriMap = Object.fromEntries(selectedItem.login?.uris?.filter((uri) => uri.uri).map((uri, index) => [`URI ${index + 1}`, uri.uri]) || []);
    const getTextFields = (item) => {
        const fieldMap = Object.fromEntries(item.fields?.map((field) => [field.name, field.value]) || []);
        return { notes: item.notes, ...item.card, ...item.identity, ...fieldMap };
    };
    const textFields = getTextFields(selectedItem);
    const handleCopyUri = (index) => async () => {
        try {
            const uriEntry = await getUpdatedVaultItem(selectedItem, (item) => item.login?.uris?.[index], "Getting uri...");
            if (uriEntry?.uri) {
                await api_1.Clipboard.copy(uriEntry.uri, { transient: (0, preferences_1.getTransientCopyPreference)("other") });
                await (0, api_1.showHUD)("Copied to clipboard");
                await (0, api_1.closeMainWindow)();
            }
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to get uri");
            (0, development_1.captureException)("Failed to copy uri", error);
        }
    };
    const handleCopyTextField = (field) => async () => {
        try {
            const value = await getUpdatedVaultItem(selectedItem, (item) => getTextFields(item)[field], `Getting ${field}...`);
            if (value) {
                await api_1.Clipboard.copy(value, { transient: (0, preferences_1.getTransientCopyPreference)("other") });
                await (0, api_1.showHUD)("Copied to clipboard");
                await (0, api_1.closeMainWindow)();
            }
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, `Failed to get ${field}`);
            (0, development_1.captureException)(`Failed to copy ${field}`, error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [Object.entries(uriMap).map(([title, content], index) => {
                if (!content)
                    return null;
                return ((0, jsx_runtime_1.jsx)(api_1.Action, { title: `Copy ${title}`, icon: api_1.Icon.Clipboard, onAction: handleCopyUri(index) }, `${index}-${title}`));
            }), Object.entries(textFields).map(([fieldKey, content], index) => {
                if (!content)
                    return null;
                const field = fieldKey;
                const capitalizedTitle = (0, strings_1.capitalize)(field);
                return ((0, jsx_runtime_1.jsx)(ActionWithReprompt_1.default, { title: `Copy ${capitalizedTitle}`, icon: api_1.Icon.Clipboard, onAction: handleCopyTextField(field), repromptDescription: `Copying the ${capitalizedTitle} of <${selectedItem.name}>` }, `${index}-${field}`));
            })] }));
}
exports.default = CopyTextFieldsActions;
