"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const RootErrorBoundary_1 = __importDefault(require("~/components/RootErrorBoundary"));
const CommonActions_1 = __importDefault(require("~/components/searchVault/actions/CommonActions"));
const vaultListeners_1 = __importDefault(require("~/components/searchVault/context/vaultListeners"));
const Item_1 = __importDefault(require("~/components/searchVault/Item"));
const bitwarden_1 = require("~/context/bitwarden");
const session_1 = require("~/context/session");
const vault_1 = require("~/context/vault");
const SearchVaultCommand = () => ((0, jsx_runtime_1.jsx)(RootErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsx)(bitwarden_1.BitwardenProvider, { children: (0, jsx_runtime_1.jsx)(session_1.SessionProvider, { unlock: true, children: (0, jsx_runtime_1.jsx)(vaultListeners_1.default, { children: (0, jsx_runtime_1.jsx)(vault_1.VaultProvider, { children: (0, jsx_runtime_1.jsx)(SearchVaultComponent, {}) }) }) }) }) }));
function SearchVaultComponent() {
    const { items, folders, isLoading, isEmpty } = (0, vault_1.useVault)();
    return ((0, jsx_runtime_1.jsxs)(api_1.List, { isLoading: isLoading, children: [items.map((item) => ((0, jsx_runtime_1.jsx)(Item_1.default, { item: item, folder: getItemFolder(folders, item) }, item.id))), isLoading ? ((0, jsx_runtime_1.jsx)(api_1.List.EmptyView, { icon: api_1.Icon.ArrowClockwise, title: "Loading...", description: "Please wait." })) : ((0, jsx_runtime_1.jsx)(api_1.List.EmptyView, { icon: { source: "bitwarden-64.png" }, title: isEmpty ? "Vault empty." : "No matching items found.", description: isEmpty
                    ? "Hit the sync button to sync your vault or try logging in again."
                    : "Hit the sync button to sync your vault.", actions: !isLoading && ((0, jsx_runtime_1.jsx)(api_1.ActionPanel, { children: (0, jsx_runtime_1.jsx)(CommonActions_1.default, {}) })) }))] }));
}
function getItemFolder(folderList, item) {
    return folderList.find((folder) => folder.id === item.folderId);
}
exports.default = SearchVaultCommand;
