"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const RepromptForm = (props) => {
    const { description, onConfirm } = props;
    async function onSubmit(values) {
        onConfirm(values.password);
    }
    return ((0, jsx_runtime_1.jsxs)(api_1.Form, { navigationTitle: "Confirmation Required", actions: (0, jsx_runtime_1.jsx)(api_1.ActionPanel, { children: (0, jsx_runtime_1.jsx)(api_1.Action.SubmitForm, { title: "Confirm", onSubmit: onSubmit, shortcut: { key: "enter", modifiers: [] } }) }), children: [(0, jsx_runtime_1.jsx)(api_1.Form.Description, { title: "Confirmation Required for", text: description }), (0, jsx_runtime_1.jsx)(api_1.Form.PasswordField, { autoFocus: true, id: "password", title: "Master Password" })] }));
};
exports.default = RepromptForm;
