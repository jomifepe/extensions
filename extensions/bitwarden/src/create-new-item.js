"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const RootErrorBoundary_1 = __importDefault(require("~/components/RootErrorBoundary"));
const labels_1 = require("~/constants/labels");
const bitwarden_1 = require("~/context/bitwarden");
const session_1 = require("~/context/session");
const vault_1 = require("~/context/vault");
const vault_2 = require("~/types/vault");
const SearchVaultCommand = () => ((0, jsx_runtime_1.jsx)(RootErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsx)(bitwarden_1.BitwardenProvider, { children: (0, jsx_runtime_1.jsx)(session_1.SessionProvider, { unlock: true, children: (0, jsx_runtime_1.jsx)(vault_1.VaultProvider, { children: (0, jsx_runtime_1.jsx)(CreateNewItemComponent, {}) }) }) }) }));
function CreateNewItemComponent() {
    const { folders } = (0, vault_1.useVault)();
    const [type, setType] = (0, react_1.useState)(vault_2.ItemType.LOGIN);
    const handleFieldChange = (field) => (value) => {
        console.log(field, value);
    };
    const handleTypeChange = (type) => {
        setType(vault_2.ItemType[type.toUpperCase()]);
    };
    const handleRepromptChange = (value) => handleFieldChange("reprompt")(+value);
    return ((0, jsx_runtime_1.jsxs)(api_1.Form, { children: [(0, jsx_runtime_1.jsxs)(api_1.Form.Dropdown, { id: "type", title: "Type", placeholder: "Select a type", onChange: handleTypeChange, children: [(0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: "login", title: "Login" }), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: "card", title: "Card" }), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: "identity", title: "Identity" }), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: "secureNote", title: "Secure Note" })] }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "name", title: "Name", onChange: handleFieldChange("name") }), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown, { id: "folder", title: "Folder", placeholder: "Select a folder", onChange: handleFieldChange("folderId"), children: folders.map((folder) => ((0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: folder.id, title: folder.name }, folder.id))) }), type === vault_2.ItemType.LOGIN && (0, jsx_runtime_1.jsx)(LoginForm, { onChange: handleFieldChange }), type === vault_2.ItemType.CARD && (0, jsx_runtime_1.jsx)(CardForm, { onChange: handleFieldChange }), type === vault_2.ItemType.IDENTITY && (0, jsx_runtime_1.jsx)(IdentityForm, { onChange: handleFieldChange }), (0, jsx_runtime_1.jsx)(api_1.Form.TextArea, { id: "notes", title: "Notes", onChange: handleFieldChange("notes") }), (0, jsx_runtime_1.jsx)(api_1.Form.Checkbox, { id: "reprompt", label: "Master password re-prompt", onChange: handleRepromptChange })] }));
}
function LoginForm({ onChange }) {
    const [uri, setUri] = (0, react_1.useState)({ uri: null, match: null });
    const handleFieldChange = (field) => (value) => {
        onChange(field === "uris" ? [value] : value);
    };
    const handleUriChange = (field) => (value) => {
        const newUri = { ...uri, [field]: field === "match" ? parseInt(value) : value };
        setUri(newUri);
        handleFieldChange("uris")([newUri]);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "username", title: "Username", onChange: handleFieldChange("username") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "password", title: "Password", onChange: handleFieldChange("password") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "totp", title: "Authenticator key (TOTP)", onChange: handleFieldChange("totp") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "url", title: "URL 1", placeholder: "URL 1", onChange: handleUriChange("uri") }), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown, { id: "match", title: "Match detection", placeholder: "Select a match", onChange: handleUriChange("match"), children: Object.entries(labels_1.URI_MATCH_TYPE_TO_LABEL_MAP).map(([key, value]) => ((0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: key, title: value }, key))) })] }));
}
function CardForm({ onChange }) {
    const handleFieldChange = (field) => (value) => {
        onChange(field, value);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "cardholderName", title: "Cardholder name", onChange: handleFieldChange("cardholderName") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "brand", title: "Brand", onChange: handleFieldChange("brand") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "number", title: "Number", onChange: handleFieldChange("number") }), (0, jsx_runtime_1.jsx)(api_1.Form.Dropdown, { id: "expMonth", title: "Expiration month", onChange: handleFieldChange("expMonth"), children: Object.entries(labels_1.MONTH_NUMBER_TO_LABEL_MAP).map(([key, value]) => ((0, jsx_runtime_1.jsx)(api_1.Form.Dropdown.Item, { value: key, title: value }, key))) }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "expYear", title: "Expiration year", onChange: handleFieldChange("expYear") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "code", title: "Security code (CVV)", onChange: handleFieldChange("code") })] }));
}
function IdentityForm({ onChange }) {
    const handleFieldChange = (field) => (value) => {
        onChange(field, value);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "firstName", title: "First name", onChange: handleFieldChange("firstName") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "middleName", title: "Middle name", onChange: handleFieldChange("middleName") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "lastName", title: "Last name", onChange: handleFieldChange("lastName") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "username", title: "Username", onChange: handleFieldChange("username") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "company", title: "Company", onChange: handleFieldChange("company") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "ssn", title: "Social Security number", onChange: handleFieldChange("ssn") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "passportNumber", title: "Passport number", onChange: handleFieldChange("passportNumber") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "licenseNumber", title: "License number", onChange: handleFieldChange("licenseNumber") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "email", title: "Email", onChange: handleFieldChange("email") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "phone", title: "Phone", onChange: handleFieldChange("phone") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "address1", title: "Address 1", onChange: handleFieldChange("address1") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "address2", title: "Address 2", onChange: handleFieldChange("address2") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "address3", title: "Address 3", onChange: handleFieldChange("address3") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "city", title: "City / Town", onChange: handleFieldChange("city") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "state", title: "State / Province", onChange: handleFieldChange("state") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "postalCode", title: "Zip / Postal code", onChange: handleFieldChange("postalCode") }), (0, jsx_runtime_1.jsx)(api_1.Form.TextField, { id: "country", title: "Country", onChange: handleFieldChange("country") })] }));
}
exports.default = SearchVaultCommand;
