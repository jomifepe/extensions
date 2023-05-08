"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardDetailsCopyValue = exports.getCardDetailsMarkdown = void 0;
const labels_1 = require("~/constants/labels");
const CARD_MAPPER = {
    expMonth: (value) => labels_1.MONTH_NUMBER_TO_LABEL_MAP[value],
};
const CARD_KEY_LABEL = {
    cardholderName: "Cardholder name",
    number: "Number",
    code: "Security code (CVV)",
    expMonth: "Expiration month",
    expYear: "Expiration year",
    brand: "Brand",
};
const getCardValue = (key, value) => {
    return CARD_MAPPER[key]?.(value) ?? value;
};
function getCardDetailsMarkdown(card) {
    return `# 💳 Card Details
---
&nbsp;
${Object.entries(card)
        .map(([key, value]) => (value ? `- **${CARD_KEY_LABEL[key]}**: ${getCardValue(key, value)}` : null))
        .join("\n")}
`;
}
exports.getCardDetailsMarkdown = getCardDetailsMarkdown;
function getCardDetailsCopyValue(card) {
    return Object.entries(card)
        .map(([key, value]) => (value ? `${CARD_KEY_LABEL[key]}: ${getCardValue(key, value)}` : null))
        .filter(Boolean)
        .join("\n");
}
exports.getCardDetailsCopyValue = getCardDetailsCopyValue;
