"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const caching_1 = require("~/components/searchVault/utils/caching");
const useVaultCaching_1 = __importStar(require("~/components/searchVault/utils/useVaultCaching"));
const cache_1 = require("~/utils/cache");
const mocks_1 = require("~/utils/testing/mocks");
const Cache = cache_1.Cache;
const getPreferenceValues = api_1.getPreferenceValues;
const prepareItemsForCache = caching_1.prepareItemsForCache;
const prepareFoldersForCache = caching_1.prepareFoldersForCache;
const MOCK_IV = "mock_initialization_vector";
const MOCK_ITEMS = (0, mocks_1.getMockItems)(3);
const MOCK_FOLDERS = (0, mocks_1.getMockFolders)(1);
const STRINGIFIED_MOCK_VAULT = JSON.stringify({ items: MOCK_ITEMS, folders: MOCK_FOLDERS });
const encryptMockFn = jest.fn((value) => ({ content: value, iv: MOCK_IV }));
const decryptMockFn = jest.fn((value) => value);
jest.mock("~/utils/hooks/useContentEncryptor", () => ({
    useContentEncryptor: () => ({
        encrypt: encryptMockFn,
        decrypt: decryptMockFn,
    }),
}));
jest.mock("~/components/searchVault/utils/caching", () => ({
    ...jest.requireActual("~/components/searchVault/utils/caching"),
    prepareItemsForCache: jest.fn((items) => items),
    prepareFoldersForCache: jest.fn((folders) => folders),
}));
describe("useVaultCache", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Cache.get.mockReturnValueOnce(MOCK_IV).mockReturnValueOnce(STRINGIFIED_MOCK_VAULT);
    });
    test("should correctly return the cached vault", async () => {
        const { getCachedVault } = (0, useVaultCaching_1.default)();
        const result = getCachedVault();
        expect(result).toEqual({ items: MOCK_ITEMS, folders: MOCK_FOLDERS });
    });
    test("should correctly cache the vault", async () => {
        const { cacheVault } = (0, useVaultCaching_1.default)();
        cacheVault(MOCK_ITEMS, MOCK_FOLDERS);
        expect(encryptMockFn).toHaveBeenCalledTimes(1);
        expect(encryptMockFn).toHaveBeenCalledWith(STRINGIFIED_MOCK_VAULT);
        expect(Cache.set).toHaveBeenCalledTimes(2);
        expect(Cache.set).toHaveBeenNthCalledWith(1, useVaultCaching_1.CACHE_KEYS.VAULT, STRINGIFIED_MOCK_VAULT);
        expect(Cache.set).toHaveBeenNthCalledWith(2, useVaultCaching_1.CACHE_KEYS.IV, MOCK_IV);
    });
    test("should not return cache or return any cached values if caching is not active", async () => {
        getPreferenceValues.mockReturnValueOnce({ shouldCacheVaultItems: false });
        const { getCachedVault, cacheVault } = (0, useVaultCaching_1.default)();
        const cachedVault = getCachedVault();
        cacheVault(MOCK_ITEMS, MOCK_FOLDERS);
        expect(cachedVault).toEqual({ items: [], folders: [] });
        expect(decryptMockFn).not.toHaveBeenCalled();
        expect(encryptMockFn).not.toHaveBeenCalled();
        expect(prepareItemsForCache).not.toHaveBeenCalled();
        expect(prepareFoldersForCache).not.toHaveBeenCalled();
        expect(Cache.get).not.toHaveBeenCalled();
        expect(Cache.set).not.toHaveBeenCalled();
    });
    test("should clear cache if caching is disabled and it's not empty", async () => {
        getPreferenceValues.mockReturnValueOnce({ shouldCacheVaultItems: false });
        jest.replaceProperty(Cache, "isEmpty", false);
        (0, useVaultCaching_1.default)();
        expect(Cache.clear).toHaveBeenCalledTimes(1);
    });
});
