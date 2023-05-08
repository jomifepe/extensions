"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const vaultListeners_1 = require("~/components/searchVault/context/vaultListeners");
const general_1 = require("~/constants/general");
/**
 * Returns a function that will get the latest value of a vault item.
 * If the value is already known, it will be returned immediately.
 * Otherwise, it will wait for the value to be retrieved from the vault.
 */
function useGetUpdatedVaultItem() {
    const getItemFromVault = (0, vaultListeners_1.useVaultItemSubscriber)();
    async function getItem(possiblyCachedItem, selector = ((item) => item), loadingMessage) {
        const currentValue = selector(possiblyCachedItem);
        if (!valueHasSensitiveValuePlaceholder(currentValue))
            return currentValue;
        const toast = loadingMessage ? await (0, api_1.showToast)(api_1.Toast.Style.Animated, loadingMessage) : undefined;
        const value = selector(await getItemFromVault(possiblyCachedItem.id));
        await toast?.hide();
        return value;
    }
    return getItem;
}
function valueHasSensitiveValuePlaceholder(value) {
    try {
        if (typeof value === "object") {
            return JSON.stringify(value).includes(general_1.SENSITIVE_VALUE_PLACEHOLDER);
        }
        else if (typeof value === "string") {
            return value === general_1.SENSITIVE_VALUE_PLACEHOLDER;
        }
        return false;
    }
    catch (error) {
        return false;
    }
}
exports.default = useGetUpdatedVaultItem;
