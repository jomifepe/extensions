import { MONTH_NUMBER_TO_LABEL_MAP } from "~/constants/labels";
import { Card } from "~/types/vault";

const CARD_MAPPER: Record<string, (value: string) => string> = {
  expMonth: (value: string) => MONTH_NUMBER_TO_LABEL_MAP[value],
};

const CARD_KEY_LABEL: Record<keyof Card, string> = {
  cardholderName: "Cardholder name",
  number: "Number",
  code: "Security code (CVV)",
  expMonth: "Expiration month",
  expYear: "Expiration year",
  brand: "Brand",
};

const getCardValue = (key: string, value: string) => {
  return CARD_MAPPER[key as keyof Card]?.(value) ?? value;
};

export function getCardDetailsMarkdown(card: Card) {
  return `# 💳 Card Details
---
${Object.entries(card)
  .map(([key, value]) => (value ? `- **${CARD_KEY_LABEL[key as keyof Card]}**: ${getCardValue(key, value)}` : null))
  .join("\n")}
`;
}

export function getCardDetailsCopyValue(card: Card) {
  return Object.entries(card)
    .map(([key, value]) => (value ? `${CARD_KEY_LABEL[key as keyof Card]}: ${getCardValue(key, value)}` : null))
    .filter(Boolean)
    .join("\n");
}
