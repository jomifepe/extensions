"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const react_1 = require("react");
const bitwarden_1 = require("~/context/bitwarden");
const preferences_1 = require("~/utils/preferences");
function useVaultMessages() {
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const [vaultState, setVaultState] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        void bitwarden.status().then((vaultState) => {
            setVaultState(vaultState);
        });
    }, []);
    const shouldShowServer = !!(0, preferences_1.getServerUrlPreference)();
    let userMessage = "...";
    let serverMessage = "...";
    if (vaultState) {
        const { status, userEmail, serverUrl } = vaultState;
        userMessage = status == "unauthenticated" ? "❌ Logged out" : `🔒 Locked (${userEmail})`;
        if (serverUrl) {
            serverMessage = serverUrl || "";
        }
        else if ((!serverUrl && shouldShowServer) || (serverUrl && !shouldShowServer)) {
            // Hosted state not in sync with CLI (we don't check for equality)
            void (0, api_1.confirmAlert)({
                icon: api_1.Icon.ExclamationMark,
                title: "Restart Required",
                message: "Bitwarden server URL preference has been changed since the extension was opened.",
                primaryAction: {
                    title: "Close Extension",
                },
                dismissAction: {
                    title: "Close Raycast",
                    style: api_1.Alert.ActionStyle.Cancel,
                },
            }).then((closeExtension) => {
                if (closeExtension) {
                    void (0, api_1.popToRoot)();
                }
                else {
                    void (0, api_1.closeMainWindow)();
                }
            });
        }
    }
    return { userMessage, serverMessage, shouldShowServer };
}
exports.default = useVaultMessages;
