"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function useAbortController() {
    const abortControllerRef = (0, react_1.useRef)(new AbortController());
    const renew = () => {
        if (!abortControllerRef.current.signal.aborted)
            return;
        abortControllerRef.current = new AbortController();
    };
    const abort = () => {
        abortControllerRef.current?.abort();
    };
    return { abortControllerRef, renew, abort };
}
exports.default = useAbortController;
