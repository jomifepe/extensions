"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faviconUrl = exports.extractKeywords = void 0;
const api_1 = require("@raycast/api");
const url_1 = require("url");
function extractKeywords(item) {
    const keywords = [item.name];
    if (item.card) {
        const { brand, number } = item.card;
        keywords.push(brand);
        if (number !== null) {
            // Similar to Bitwarden, use the last 5 digits if the card is Amex
            const isAmex = /^3[47]/.test(number);
            keywords.push(number.substring(number.length - (isAmex ? 5 : 4), number.length));
        }
    }
    keywords.push(item.login?.username);
    if (item.login?.uris) {
        for (const uri of item.login.uris) {
            if (uri.uri !== null) {
                try {
                    keywords.push(...new url_1.URL(uri.uri).hostname.split("."));
                }
                catch (error) {
                    // Invalid hostname
                }
            }
        }
    }
    // Unique keywords
    const uniqueKeywords = new Set(keywords.filter((keyword) => !!keyword));
    return [...uniqueKeywords];
}
exports.extractKeywords = extractKeywords;
function faviconUrl(url) {
    try {
        const domain = new url_1.URL(url).hostname;
        return `https://icons.bitwarden.net/${domain}/icon.png`;
    }
    catch (err) {
        return api_1.Icon.Globe;
    }
}
exports.faviconUrl = faviconUrl;
