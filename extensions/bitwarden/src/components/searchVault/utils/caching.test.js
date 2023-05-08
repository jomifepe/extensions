"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const general_1 = require("~/constants/general");
const caching_1 = require("~/components/searchVault/utils/caching");
const mocks_1 = require("~/utils/testing/mocks");
const SENSITIVE_VALUE = "THIS-IS-A-SENSITIVE-VALUE";
describe("prepareItemsForCache & prepareFoldersForCache", () => {
    test("should clean items and folders of any sensitive values", () => {
        const items = (0, mocks_1.getMockItems)(100, { sensitiveValue: SENSITIVE_VALUE });
        const folders = (0, mocks_1.getMockFolders)(100);
        const amountOfSensitiveValuesInItems = getStringValueCount(JSON.stringify(items), SENSITIVE_VALUE);
        const amountOfSensitiveValuesInFolders = getStringValueCount(JSON.stringify(folders), SENSITIVE_VALUE);
        const stringifiedCleanItems = JSON.stringify((0, caching_1.prepareItemsForCache)(items));
        const stringifiedCleanFolders = JSON.stringify((0, caching_1.prepareFoldersForCache)(folders));
        expect(stringifiedCleanFolders).not.toContain(SENSITIVE_VALUE);
        expect(stringifiedCleanFolders).not.toContain(SENSITIVE_VALUE);
        if (amountOfSensitiveValuesInItems > 0) {
            const amountOfHiddenValuesInCleanItems = getStringValueCount(stringifiedCleanItems, general_1.SENSITIVE_VALUE_PLACEHOLDER);
            expect(amountOfSensitiveValuesInItems).toEqual(amountOfHiddenValuesInCleanItems);
        }
        if (amountOfSensitiveValuesInFolders > 0) {
            const amountOfHiddenValuesInCleanFolders = getStringValueCount(stringifiedCleanFolders, general_1.SENSITIVE_VALUE_PLACEHOLDER);
            expect(amountOfSensitiveValuesInFolders).toEqual(amountOfHiddenValuesInCleanFolders);
        }
    });
    test("should not replace sensitive properties if they are empty already", () => {
        const items = JSON.stringify((0, caching_1.prepareItemsForCache)((0, mocks_1.getMockItems)(10, { sensitiveValue: "" })));
        expect(getStringValueCount(items, general_1.SENSITIVE_VALUE_PLACEHOLDER)).toEqual(0);
    });
    test("should not include fields that aren't accounted for", () => {
        const itemCount = 10;
        const newPropertyName = "unaccountedProperty";
        const items1 = (0, caching_1.prepareItemsForCache)((0, mocks_1.getMockItems)(itemCount));
        const items1SensitiveCount = getStringValueCount(JSON.stringify(items1), SENSITIVE_VALUE);
        /* @ts-expect-error */
        const items2 = (0, mocks_1.getMockItems)(itemCount, { overrideProps: { [newPropertyName]: SENSITIVE_VALUE } });
        const items2PreparedStringified = JSON.stringify((0, caching_1.prepareItemsForCache)(items2));
        // test the amount of new properties that exist before preparing for cache
        expect(getStringValueCount(JSON.stringify(items2), newPropertyName)).toEqual(itemCount);
        // test the amount of new properties that exist after preparing for cache
        expect(getStringValueCount(items2PreparedStringified, newPropertyName)).toEqual(0);
        // check that the amount of sensitive values is the same as with items without new properties
        expect(items1SensitiveCount).toEqual(getStringValueCount(items2PreparedStringified, SENSITIVE_VALUE));
        const folders1 = (0, caching_1.prepareFoldersForCache)((0, mocks_1.getMockFolders)(itemCount));
        const folders1SensitiveCount = getStringValueCount(JSON.stringify(folders1), SENSITIVE_VALUE);
        /* @ts-expect-error */
        const folders2 = (0, mocks_1.getMockItems)(itemCount, { overrideProps: { [newPropertyName]: SENSITIVE_VALUE } });
        const folders2PreparedStringified = JSON.stringify((0, caching_1.prepareItemsForCache)(folders2));
        // test the amount of new properties that exist before preparing for cache
        expect(getStringValueCount(JSON.stringify(folders2), newPropertyName)).toEqual(itemCount);
        // test the amount of new properties that exist after preparing for cache
        expect(getStringValueCount(folders2PreparedStringified, newPropertyName)).toEqual(0);
        // check that the amount of sensitive values is the same as with folders without new properties
        expect(folders1SensitiveCount).toEqual(getStringValueCount(folders2PreparedStringified, SENSITIVE_VALUE));
    });
});
function getStringValueCount(value, valueToFind) {
    return value.match(new RegExp(valueToFind, "g"))?.length ?? 0;
}
