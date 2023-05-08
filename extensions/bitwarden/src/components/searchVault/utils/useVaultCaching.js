"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEYS = void 0;
const api_1 = require("@raycast/api");
const caching_1 = require("~/components/searchVault/utils/caching");
const cache_1 = require("~/utils/cache");
const development_1 = require("~/utils/development");
const useContentEncryptor_1 = require("~/utils/hooks/useContentEncryptor");
const useOnceEffect_1 = __importDefault(require("~/utils/hooks/useOnceEffect"));
exports.CACHE_KEYS = {
    IV: "iv",
    VAULT: "vault",
};
function useVaultCaching() {
    const { encrypt, decrypt } = (0, useContentEncryptor_1.useContentEncryptor)();
    const isCachingEnable = (0, api_1.getPreferenceValues)().shouldCacheVaultItems;
    (0, useOnceEffect_1.default)(() => {
        // users that opt out of caching probably want to delete any cached data
        if (!cache_1.Cache.isEmpty)
            cache_1.Cache.clear();
    }, !isCachingEnable);
    const getCachedVault = () => {
        try {
            if (!isCachingEnable)
                throw new VaultCachingNoEnabledError();
            const cachedIv = cache_1.Cache.get(exports.CACHE_KEYS.IV);
            const cachedEncryptedVault = cache_1.Cache.get(exports.CACHE_KEYS.VAULT);
            if (!cachedIv || !cachedEncryptedVault)
                throw new VaultCachingNoEnabledError();
            const decryptedVault = decrypt(cachedEncryptedVault, cachedIv);
            return JSON.parse(decryptedVault);
        }
        catch (error) {
            if (!(error instanceof VaultCachingNoEnabledError)) {
                (0, development_1.captureException)("Failed to decrypt cached vault", error);
            }
            return { items: [], folders: [] };
        }
    };
    const cacheVault = (items, folders) => {
        try {
            if (!isCachingEnable)
                throw new VaultCachingNoEnabledError();
            const vaultToEncrypt = JSON.stringify({
                items: (0, caching_1.prepareItemsForCache)(items),
                folders: (0, caching_1.prepareFoldersForCache)(folders),
            });
            const encryptedVault = encrypt(vaultToEncrypt);
            cache_1.Cache.set(exports.CACHE_KEYS.VAULT, encryptedVault.content);
            cache_1.Cache.set(exports.CACHE_KEYS.IV, encryptedVault.iv);
        }
        catch (error) {
            if (!(error instanceof VaultCachingNoEnabledError)) {
                (0, development_1.captureException)("Failed to cache vault", error);
            }
        }
    };
    return { getCachedVault, cacheVault };
}
class VaultCachingNoEnabledError extends Error {
}
exports.default = useVaultCaching;
