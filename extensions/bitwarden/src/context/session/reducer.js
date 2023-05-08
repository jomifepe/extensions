"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSessionReducer = void 0;
const react_1 = require("react");
const initialState = {
    token: undefined,
    isLoading: true,
    isLocked: false,
    isAuthenticated: false,
    passwordHash: undefined,
    lastActivityTime: undefined,
    lockReason: undefined,
};
const useSessionReducer = () => {
    return (0, react_1.useReducer)((state, action) => {
        switch (action.type) {
            case "lock": {
                return {
                    ...state,
                    token: undefined,
                    passwordHash: undefined,
                    isLoading: false,
                    isLocked: true,
                    lockReason: action.lockReason,
                };
            }
            case "unlock": {
                return {
                    ...state,
                    token: action.token,
                    passwordHash: action.passwordHash,
                    isLocked: false,
                    isAuthenticated: true,
                    lockReason: undefined,
                };
            }
            case "logout": {
                return { ...state, token: undefined, passwordHash: undefined, isAuthenticated: false };
            }
            case "vaultTimeout": {
                return { ...state, isLocked: true };
            }
            case "loadSavedState": {
                const hasToken = !!action.token;
                return {
                    ...state,
                    token: action.token,
                    passwordHash: action.passwordHash,
                    lastActivityTime: action.lastActivityTime,
                    isLoading: false,
                    isLocked: action.shouldLockVault || !hasToken,
                    isAuthenticated: hasToken,
                    lockReason: action.lockReason,
                };
            }
            case "failedLoadSavedState": {
                return { ...state, isLoading: false, isLocked: true };
            }
            default:
                return state;
        }
    }, initialState);
};
exports.useSessionReducer = useSessionReducer;
