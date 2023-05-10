import { VAULT_TIMEOUT } from "~/constants/preferences";
import { CardBrand, IdentityTitle, UriMatch } from "~/types/vault";

export const MONTH_NUMBER_TO_LABEL_MAP = {
  1: "01 - January",
  2: "02 - February",
  3: "03 - March",
  4: "04 - April",
  5: "05 - May",
  6: "06 - June",
  7: "07 - July",
  8: "08 - August",
  9: "09 - September",
  10: "10 - October",
  11: "11 - November",
  12: "12 - December",
} as Record<string, string>;

export const IDENTITY_TITLE_TO_LABEL_MAP = {
  [IdentityTitle.MR]: "Mr",
  [IdentityTitle.MRS]: "Mrs",
  [IdentityTitle.MS]: "Ms",
  [IdentityTitle.MX]: "Mx",
  [IdentityTitle.DR]: "Dr",
} as Record<string, string>;

export const CARD_BRAND_TO_LABEL_MAP = {
  [CardBrand.VISA]: "Visa",
  [CardBrand.MASTERCARD]: "MasterCard",
  [CardBrand.AMEX]: "American Express",
  [CardBrand.DISCOVER]: "Discover",
  [CardBrand.DINERS_CLUB]: "Diners Club",
  [CardBrand.JCB]: "JCB",
  [CardBrand.MAESTRO]: "Maestro",
  [CardBrand.UNIONPAY]: "UnionPay",
  [CardBrand.RUPAY]: "RuPay",
  [CardBrand.OTHER]: "Other",
} as Record<string, string>;

export const VAULT_TIMEOUT_MS_TO_LABEL_MAP = {
  [VAULT_TIMEOUT.IMMEDIATELY]: "Immediately",
  [VAULT_TIMEOUT.ONE_MINUTE]: "1 Minute",
  [VAULT_TIMEOUT.FIVE_MINUTES]: "5 Minutes",
  [VAULT_TIMEOUT.FIFTEEN_MINUTES]: "15 Minutes",
  [VAULT_TIMEOUT.THIRTY_MINUTES]: "30 Minutes",
  [VAULT_TIMEOUT.ONE_HOUR]: "1 Hour",
  [VAULT_TIMEOUT.FOUR_HOURS]: "4 Hours",
  [VAULT_TIMEOUT.EIGHT_HOURS]: "8 Hours",
  [VAULT_TIMEOUT.ONE_DAY]: "1 Day",
};

export const URI_MATCH_TYPE_TO_LABEL_MAP = {
  [UriMatch.BASE_DOMAIN]: "Base domain",
  [UriMatch.HOST]: "Host",
  [UriMatch.STARTS_WITH]: "Starts with",
  [UriMatch.EXACT]: "Exact",
  [UriMatch.REGULAR_EXPRESSION]: "Regular Expression",
  [UriMatch.NEVER]: "Never",
} as Record<UriMatch, string>;
