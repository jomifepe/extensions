"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAULT_TIMEOUT_MS_TO_LABEL = exports.VAULT_TIMEOUT = void 0;
exports.VAULT_TIMEOUT = {
    IMMEDIATELY: 0,
    ONE_MINUTE: 60000,
    FIVE_MINUTES: 300000,
    FIFTEEN_MINUTES: 900000,
    THIRTY_MINUTES: 1800000,
    ONE_HOUR: 3600000,
    FOUR_HOURS: 14400000,
    EIGHT_HOURS: 28800000,
    ONE_DAY: 86400000,
    NEVER: -1,
};
exports.VAULT_TIMEOUT_MS_TO_LABEL = {
    [exports.VAULT_TIMEOUT.IMMEDIATELY]: "Immediately",
    [exports.VAULT_TIMEOUT.ONE_MINUTE]: "1 Minute",
    [exports.VAULT_TIMEOUT.FIVE_MINUTES]: "5 Minutes",
    [exports.VAULT_TIMEOUT.FIFTEEN_MINUTES]: "15 Minutes",
    [exports.VAULT_TIMEOUT.THIRTY_MINUTES]: "30 Minutes",
    [exports.VAULT_TIMEOUT.ONE_HOUR]: "1 Hour",
    [exports.VAULT_TIMEOUT.FOUR_HOURS]: "4 Hours",
    [exports.VAULT_TIMEOUT.EIGHT_HOURS]: "8 Hours",
    [exports.VAULT_TIMEOUT.ONE_DAY]: "1 Day",
};
