"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
/** `useEffect` that only runs once after the `condition` is met */
function useOnceEffect(effect, condition) {
    const hasRun = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        if (hasRun.current)
            return;
        if (!condition)
            return;
        hasRun.current = true;
        if (isAsyncFunction(effect)) {
            void effect();
            return undefined;
        }
        return effect();
    }, [condition]);
}
function isAsyncFunction(fn) {
    return fn.constructor.name === "AsyncFunction";
}
exports.default = useOnceEffect;
