"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const ComponentReverser_1 = __importDefault(require("~/components/ComponentReverser"));
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const actions_1 = require("~/components/searchVault/actions");
const { primaryAction } = (0, api_1.getPreferenceValues)();
const VaultItemActionPanel = () => {
    const { login, card } = (0, vaultItem_1.useSelectedVaultItem)();
    return ((0, jsx_runtime_1.jsxs)(api_1.ActionPanel, { children: [!!login && ((0, jsx_runtime_1.jsxs)(api_1.ActionPanel.Section, { children: [(0, jsx_runtime_1.jsxs)(ComponentReverser_1.default, { reverse: primaryAction === "copy", children: [(0, jsx_runtime_1.jsx)(actions_1.PastePasswordAction, {}), (0, jsx_runtime_1.jsx)(actions_1.CopyPasswordAction, {})] }), (0, jsx_runtime_1.jsx)(actions_1.CopyTotpAction, {}), (0, jsx_runtime_1.jsx)(actions_1.CopyUsernameAction, {}), (0, jsx_runtime_1.jsx)(actions_1.OpenUrlInBrowserAction, {})] })), !!card && ((0, jsx_runtime_1.jsxs)(api_1.ActionPanel.Section, { children: [(0, jsx_runtime_1.jsx)(actions_1.ShowCardDetailsAction, {}), (0, jsx_runtime_1.jsx)(actions_1.ShowSecureNoteAction, {})] })), (0, jsx_runtime_1.jsx)(api_1.ActionPanel.Section, { children: (0, jsx_runtime_1.jsx)(actions_1.CopyTextFieldsActions, {}) }), (0, jsx_runtime_1.jsx)(api_1.ActionPanel.Section, { children: (0, jsx_runtime_1.jsx)(actions_1.SearchCommonActions, {}) })] }));
};
exports.default = VaultItemActionPanel;
