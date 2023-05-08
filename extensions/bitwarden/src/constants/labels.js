"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URI_MATCH_TYPE_TO_LABEL_MAP = exports.VAULT_TIMEOUT_MS_TO_LABEL_MAP = exports.MONTH_NUMBER_TO_LABEL_MAP = void 0;
const preferences_1 = require("~/constants/preferences");
const vault_1 = require("~/types/vault");
exports.MONTH_NUMBER_TO_LABEL_MAP = {
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
};
exports.VAULT_TIMEOUT_MS_TO_LABEL_MAP = {
    [preferences_1.VAULT_TIMEOUT.IMMEDIATELY]: "Immediately",
    [preferences_1.VAULT_TIMEOUT.ONE_MINUTE]: "1 Minute",
    [preferences_1.VAULT_TIMEOUT.FIVE_MINUTES]: "5 Minutes",
    [preferences_1.VAULT_TIMEOUT.FIFTEEN_MINUTES]: "15 Minutes",
    [preferences_1.VAULT_TIMEOUT.THIRTY_MINUTES]: "30 Minutes",
    [preferences_1.VAULT_TIMEOUT.ONE_HOUR]: "1 Hour",
    [preferences_1.VAULT_TIMEOUT.FOUR_HOURS]: "4 Hours",
    [preferences_1.VAULT_TIMEOUT.EIGHT_HOURS]: "8 Hours",
    [preferences_1.VAULT_TIMEOUT.ONE_DAY]: "1 Day",
};
exports.URI_MATCH_TYPE_TO_LABEL_MAP = {
    [vault_1.UriMatch.BASE_DOMAIN]: "Base domain",
    [vault_1.UriMatch.HOST]: "Host",
    [vault_1.UriMatch.STARTS_WITH]: "Starts with",
    [vault_1.UriMatch.EXACT]: "Exact",
    [vault_1.UriMatch.REGULAR_EXPRESSION]: "Regular Expression",
    [vault_1.UriMatch.NEVER]: "Never",
};
