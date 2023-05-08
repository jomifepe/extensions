"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const general_1 = require("~/constants/general");
const preferences_1 = require("~/utils/preferences");
const GeneratePasswordActionPanel = (props) => {
    const { password, regeneratePassword } = props;
    return ((0, jsx_runtime_1.jsxs)(api_1.ActionPanel, { children: [!!password && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(api_1.Action.CopyToClipboard, { title: "Copy Password", icon: api_1.Icon.Clipboard, content: password, shortcut: { key: "enter", modifiers: ["cmd"] }, transient: (0, preferences_1.getTransientCopyPreference)("password") }), (0, jsx_runtime_1.jsx)(api_1.Action.Paste, { title: "Paste Password to Active App", icon: api_1.Icon.Text, content: password, shortcut: { key: "enter", modifiers: ["cmd", "shift"] } })] })), (0, jsx_runtime_1.jsx)(api_1.Action, { title: "Regenerate Password", icon: api_1.Icon.ArrowClockwise, onAction: regeneratePassword, shortcut: { key: "backspace", modifiers: ["cmd"] } }), process.env.NODE_ENV === "development" && ((0, jsx_runtime_1.jsx)(api_1.Action, { title: "Clear storage", icon: api_1.Icon.Trash, onAction: clearStorage }))] }));
};
async function clearStorage() {
    for (const key of Object.values(general_1.LOCAL_STORAGE_KEY)) {
        await api_1.LocalStorage.removeItem(key);
    }
}
exports.default = GeneratePasswordActionPanel;
