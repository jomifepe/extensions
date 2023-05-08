"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const ActionWithReprompt_1 = __importDefault(require("~/components/actions/ActionWithReprompt"));
const vaultItem_1 = require("~/components/searchVault/context/vaultItem");
const useGetUpdatedVaultItem_1 = __importDefault(require("~/components/searchVault/utils/useGetUpdatedVaultItem"));
const cards_1 = require("~/utils/cards");
const development_1 = require("~/utils/development");
const preferences_1 = require("~/utils/preferences");
function ShowCardDetailsAction() {
    const { push } = (0, api_1.useNavigation)();
    const selectedItem = (0, vaultItem_1.useSelectedVaultItem)();
    const getUpdatedVaultItem = (0, useGetUpdatedVaultItem_1.default)();
    if (!selectedItem.card)
        return null;
    const showCardDetails = async () => {
        try {
            const card = await getUpdatedVaultItem(selectedItem, (item) => item.card, "Getting card details...");
            if (card) {
                push((0, jsx_runtime_1.jsx)(api_1.Detail, { markdown: (0, cards_1.getCardDetailsMarkdown)(card), actions: (0, jsx_runtime_1.jsx)(api_1.ActionPanel, { children: (0, jsx_runtime_1.jsx)(api_1.Action.CopyToClipboard, { title: "Copy Card Details", content: (0, cards_1.getCardDetailsCopyValue)(card), transient: (0, preferences_1.getTransientCopyPreference)("other") }) }) }));
            }
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to get card details");
            (0, development_1.captureException)("Failed to show card details", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ActionWithReprompt_1.default, { title: "Show Card Details", icon: api_1.Icon.CreditCard, onAction: showCardDetails, repromptDescription: `Showing the card details of <${selectedItem.name}>` }));
}
exports.default = ShowCardDetailsAction;
