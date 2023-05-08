"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const useReprompt_1 = __importDefault(require("~/utils/hooks/useReprompt"));
function ActionWithReprompt(props) {
    const { repromptDescription, onAction, ...componentProps } = props;
    const { reprompt } = (0, vaultItem_1.useSelectedVaultItem)();
    const repromptAndPerformAction = (0, useReprompt_1.default)(onAction, { description: repromptDescription });
    return (0, jsx_runtime_1.jsx)(api_1.Action, { ...componentProps, onAction: reprompt ? repromptAndPerformAction : onAction });
}
exports.default = ActionWithReprompt;
