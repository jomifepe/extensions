"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const RepromptForm_1 = __importDefault(require("~/components/RepromptForm"));
const session_1 = require("~/context/session");
/**
 * Returns a function for an Action that will navigate to the {@link RepromptForm}.
 * The password is not confirm in this hook, only passed down to the action.
 */
function useReprompt(action, options) {
    const { description = "Performing an action that requires the master password" } = options ?? {};
    const session = (0, session_1.useSession)();
    const { push, pop } = (0, api_1.useNavigation)();
    async function handleConfirm(password) {
        const isPasswordCorrect = await session.confirmMasterPassword(password);
        if (!isPasswordCorrect) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to unlock vault", "Check your credentials");
            return;
        }
        pop();
        /* using a setTimeout here fixes a bug where the RepromptForm flashes when you pop back to the previous screen.
        This comes with the trade-off of a tiny visible delay between the RepromptForm pop and the action pushing a new screen */
        setTimeout(action, 1);
    }
    return () => push((0, jsx_runtime_1.jsx)(RepromptForm_1.default, { description: description, onConfirm: handleConfirm }));
}
exports.default = useReprompt;
