"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
function GeneratePasswordOptionField({ option, defaultValue = "", onChange: handleChange, errorMessage, field, }) {
    const { hint = "", label, type } = field;
    const [error, setError] = (0, react_1.useState)();
    const handleTextFieldChange = async (value) => {
        if (isValidFieldValue(option, value)) {
            await handleChange(value);
            setError(undefined);
        }
        else {
            setError(errorMessage);
        }
    };
    if (type === "boolean") {
        return ((0, jsx_runtime_1.jsx)(api_1.Form.Checkbox, { id: option, title: label, label: hint, defaultValue: Boolean(defaultValue), onChange: handleChange }, option));
    }
    return ((0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: option, title: label, placeholder: hint, defaultValue: String(defaultValue), onChange: handleTextFieldChange, error: error }, option));
}
function isValidFieldValue(field, value) {
    if (field === "length")
        return !isNaN(Number(value)) && Number(value) >= 5 && Number(value) <= 128;
    if (field === "separator")
        return value.length === 1;
    if (field === "words")
        return !isNaN(Number(value)) && Number(value) >= 3 && Number(value) <= 20;
    return true;
}
exports.default = GeneratePasswordOptionField;
