"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omitSensitiveValueFromString = exports.treatError = void 0;
const objects_1 = require("~/utils/objects");
function treatError(error, options) {
    try {
        const execaError = error;
        let errorString;
        if (execaError?.stderr) {
            errorString = execaError.stderr;
        }
        else if (error instanceof Error) {
            errorString = `${error.name}: ${error.message}`;
        }
        else if ((0, objects_1.isObject)(error)) {
            errorString = JSON.stringify(error);
        }
        else {
            errorString = `${error}`;
        }
        if (!errorString)
            return "";
        if (!options?.omitSensitiveValue)
            return errorString;
        return omitSensitiveValueFromString(errorString, options.omitSensitiveValue);
    }
    catch {
        return "";
    }
}
exports.treatError = treatError;
function omitSensitiveValueFromString(value, sensitiveValue) {
    return value.replace(new RegExp(sensitiveValue, "i"), "[REDACTED]");
}
exports.omitSensitiveValueFromString = omitSensitiveValueFromString;
