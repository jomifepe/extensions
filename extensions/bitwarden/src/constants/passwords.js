"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_OPTIONS_MAP = exports.DEFAULT_PASSWORD_OPTIONS = exports.REPROMPT_HASH_SALT = void 0;
exports.REPROMPT_HASH_SALT = "foobarbazzybaz";
exports.DEFAULT_PASSWORD_OPTIONS = {
    lowercase: true,
    uppercase: true,
    number: false,
    special: false,
    passphrase: false,
    length: 14,
    words: 3,
    separator: "-",
    capitalize: false,
    includeNumber: false,
};
exports.PASSWORD_OPTIONS_MAP = {
    password: {
        length: {
            label: "Length of the password",
            hint: "5 - 128",
            type: "number",
            errorMessage: "Number between 5 and 128",
        },
        uppercase: {
            label: "Uppercase characters",
            hint: "ABCDEFGHIJLMNOPQRSTUVWXYZ",
            type: "boolean",
        },
        lowercase: {
            label: "Lowercase characters",
            hint: "abcdefghijklmnopqrstuvwxyz",
            type: "boolean",
        },
        number: {
            label: "Numeric characters",
            hint: "0123456789",
            type: "boolean",
        },
        special: {
            label: "Special characters",
            hint: "!@#$%^&*()_+-=[]{}|;:,./<>?",
            type: "boolean",
        },
    },
    passphrase: {
        words: {
            label: "Number of words",
            hint: "3 - 20",
            type: "number",
            errorMessage: "Number between 3 and 20",
        },
        separator: {
            label: "Word separator",
            hint: "this-is-a-passphrase",
            type: "string",
            errorMessage: "Must be a single character",
        },
        capitalize: {
            label: "Capitalise",
            hint: "This-Is-A-Passphrase",
            type: "boolean",
        },
        includeNumber: {
            label: "Include number",
            hint: "This2-Is-A-Passphrase",
            type: "boolean",
        },
    },
};
