"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useContentEncryptor = void 0;
const api_1 = require("@raycast/api");
const crypto_1 = require("crypto");
const react_1 = require("react");
const ALGORITHM = "aes-256-cbc";
/** Encrypts and decrypts data using the user's client secret */
function useContentEncryptor() {
    const { clientSecret } = (0, api_1.getPreferenceValues)();
    const cipherKeyBuffer = (0, react_1.useMemo)(() => get32BitSecretKeyBuffer(clientSecret.trim()), [clientSecret]);
    const encrypt = (data) => {
        const ivBuffer = (0, crypto_1.randomBytes)(16);
        const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, cipherKeyBuffer, ivBuffer);
        const encryptedContentBuffer = Buffer.concat([cipher.update(data), cipher.final()]);
        return { iv: ivBuffer.toString("hex"), content: encryptedContentBuffer.toString("hex") };
    };
    const decrypt = (content, iv) => {
        const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, cipherKeyBuffer, Buffer.from(iv, "hex"));
        const decryptedContentBuffer = Buffer.concat([decipher.update(Buffer.from(content, "hex")), decipher.final()]);
        return decryptedContentBuffer.toString();
    };
    return { encrypt, decrypt };
}
exports.useContentEncryptor = useContentEncryptor;
function get32BitSecretKeyBuffer(key) {
    return Buffer.from((0, crypto_1.createHash)("sha256").update(key).digest("base64").slice(0, 32));
}
