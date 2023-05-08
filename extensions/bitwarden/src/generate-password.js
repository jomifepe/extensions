"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const strings_1 = require("~/utils/strings");
const useOneTimePasswordHistoryWarning_1 = __importDefault(require("~/utils/hooks/useOneTimePasswordHistoryWarning"));
const usePasswordGenerator_1 = __importDefault(require("~/utils/hooks/usePasswordGenerator"));
const passwords_1 = require("~/constants/passwords");
const objects_1 = require("~/utils/objects");
const ActionPanel_1 = __importDefault(require("~/components/generatePassword/ActionPanel"));
const bitwarden_1 = require("~/context/bitwarden");
const RootErrorBoundary_1 = __importDefault(require("~/components/RootErrorBoundary"));
const OptionField_1 = __importDefault(require("~/components/generatePassword/OptionField"));
const FormSpace = () => (0, jsx_runtime_1.jsx)(api_1.Form.Description, { text: "" });
const GeneratePasswordCommand = () => ((0, jsx_runtime_1.jsx)(RootErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsx)(bitwarden_1.BitwardenProvider, { children: (0, jsx_runtime_1.jsx)(GeneratePasswordComponent, {}) }) }));
function GeneratePasswordComponent() {
    const { password, regeneratePassword, isGenerating, options, setOption } = (0, usePasswordGenerator_1.default)();
    (0, useOneTimePasswordHistoryWarning_1.default)();
    if (!options)
        return (0, jsx_runtime_1.jsx)(api_1.Detail, { isLoading: true });
    const handlePasswordTypeChange = (type) => setOption("passphrase", type === "passphrase");
    const handleFieldChange = (field) => {
        return (value) => setOption(field, value);
    };
    const passwordType = options?.passphrase ? "passphrase" : "password";
    return ((0, jsx_runtime_1.jsxs)(api_1.Form, { isLoading: isGenerating, actions: (0, jsx_runtime_1.jsx)(ActionPanel_1.default, { password: password, regeneratePassword: regeneratePassword }), children: [(0, jsx_runtime_1.jsx)(api_1.Form.Description, { title: "\uD83D\uDD11  Password", text: password ?? "Generating..." }), (0, jsx_runtime_1.jsx)(FormSpace, {}), (0, jsx_runtime_1.jsx)(api_1.Form.Separator, {}), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown, { id: "type", title: "Type", value: passwordType, onChange: handlePasswordTypeChange, autoFocus: true, children: Object.keys(passwords_1.PASSWORD_OPTIONS_MAP).map((key) => ((0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: key, title: (0, strings_1.capitalize)(key) }, key))) }), (0, objects_1.objectEntries)(passwords_1.PASSWORD_OPTIONS_MAP[passwordType]).map(([optionType, optionField]) => ((0, jsx_runtime_1.jsx)(OptionField_1.default, { option: optionType, field: optionField, defaultValue: options[optionType], errorMessage: optionField.errorMessage, onChange: handleFieldChange(optionType) }, optionType)))] }));
}
exports.default = GeneratePasswordCommand;
