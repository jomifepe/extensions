"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const bitwarden_1 = require("~/context/bitwarden");
const vault_1 = require("~/context/vault");
function SearchCommonActions() {
    const vault = (0, vault_1.useVault)();
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const handleLockVault = async () => {
        const toast = await (0, api_1.showToast)(api_1.Toast.Style.Animated, "Locking Vault...", "Please wait");
        await bitwarden.lock("Manually locked by the user");
        await toast.hide();
    };
    const handleLogoutVault = async () => {
        const toast = await (0, api_1.showToast)({ title: "Logging Out...", style: api_1.Toast.Style.Animated });
        await bitwarden.logout();
        await toast.hide();
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(api_1.Action, { title: "Sync Vault", shortcut: { modifiers: ["cmd"], key: "r" }, icon: api_1.Icon.ArrowClockwise, onAction: vault.syncItems }), (0, jsx_runtime_1.jsx)(api_1.Action, { icon: { source: "sf_symbols_lock.svg", tintColor: api_1.Color.PrimaryText }, title: "Lock Vault", shortcut: { modifiers: ["cmd", "shift"], key: "l" }, onAction: handleLockVault }), (0, jsx_runtime_1.jsx)(api_1.Action, { style: api_1.Action.Style.Destructive, title: "Logout", icon: api_1.Icon.Logout, onAction: handleLogoutVault })] }));
}
exports.default = SearchCommonActions;
