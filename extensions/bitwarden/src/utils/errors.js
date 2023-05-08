"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisplayableErrorMessage = exports.VaultIsLockedError = exports.FailedToLoadVaultItemsError = exports.CLINotFoundError = exports.DisplayableError = exports.ManuallyThrownError = void 0;
class ManuallyThrownError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ManuallyThrownError = ManuallyThrownError;
class DisplayableError extends ManuallyThrownError {
    constructor(message) {
        super(message);
    }
}
exports.DisplayableError = DisplayableError;
class CLINotFoundError extends DisplayableError {
    constructor(message) {
        super(message ?? "Bitwarden CLI not found");
        this.name = "CLINotFoundError";
    }
}
exports.CLINotFoundError = CLINotFoundError;
class FailedToLoadVaultItemsError extends ManuallyThrownError {
    constructor(message) {
        super(message ?? "Failed to load vault items");
        this.name = "FailedToLoadVaultItemsError";
    }
}
exports.FailedToLoadVaultItemsError = FailedToLoadVaultItemsError;
class VaultIsLockedError extends DisplayableError {
    constructor(message) {
        super(message ?? "Vault is locked");
        this.name = "VaultIsLockedError";
    }
}
exports.VaultIsLockedError = VaultIsLockedError;
function getDisplayableErrorMessage(error) {
    if (error instanceof DisplayableError)
        return error.message;
    return undefined;
}
exports.getDisplayableErrorMessage = getDisplayableErrorMessage;
