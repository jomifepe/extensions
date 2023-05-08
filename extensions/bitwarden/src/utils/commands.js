"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAppleScript = void 0;
const execa_1 = require("execa");
/**
 * Runs an AppleScript script.
 *
 * @param appleScript The script code.
 * @param args The arguments to pass to the script.
 */
async function runAppleScript(appleScript, args) {
    const { stdout } = await (0, execa_1.execa)("/usr/bin/osascript", ["-e", appleScript, ...args], { shell: false });
    return stdout;
}
exports.runAppleScript = runAppleScript;
