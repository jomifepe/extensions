"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeBlock = exports.capitalize = void 0;
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
exports.capitalize = capitalize;
function codeBlock(content) {
    return "```\n" + content + "\n```";
}
exports.codeBlock = codeBlock;
