"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const useContentEncryptor_1 = require("~/utils/hooks/useContentEncryptor");
const getPreferenceValues = api_1.getPreferenceValues;
const MOCK_CLIENT_SECRET = "test";
describe("useContentEncryptor", () => {
    beforeAll(() => {
        getPreferenceValues.mockReturnValue({ clientSecret: MOCK_CLIENT_SECRET });
    });
    it("should encrypt and decrypt data", () => {
        const { encrypt, decrypt } = (0, useContentEncryptor_1.useContentEncryptor)();
        const plainData = "thisisatest";
        const { content, iv } = encrypt(plainData);
        expect(decrypt(content, iv)).toEqual(plainData);
    });
    it("should not decrypt with the wrong initialization vector", () => {
        const { encrypt, decrypt } = (0, useContentEncryptor_1.useContentEncryptor)();
        const { content } = encrypt("something");
        expect(() => decrypt(content, "wrongiv")).toThrowError();
    });
});
