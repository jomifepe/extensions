"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSession = exports.SessionProvider = exports.SessionContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const UnlockForm_1 = __importDefault(require("~/components/UnlockForm"));
const bitwarden_1 = require("~/context/bitwarden");
const reducer_1 = require("~/context/session/reducer");
const utils_1 = require("~/context/session/utils");
const cache_1 = require("~/utils/cache");
const development_1 = require("~/utils/development");
const errors_1 = require("~/utils/errors");
const useOnceEffect_1 = __importDefault(require("~/utils/hooks/useOnceEffect"));
const passwords_1 = require("~/utils/passwords");
exports.SessionContext = (0, react_1.createContext)(null);
/**
 * Component which provides a session via the {@link useSession} hook.
 * @param props.unlock If true, an unlock form will be displayed if the vault is locked or unauthenticated.
 */
function SessionProvider(props) {
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const [state, dispatch] = (0, reducer_1.useSessionReducer)();
    (0, useOnceEffect_1.default)(async () => {
        try {
            bitwarden
                .setActionCallback("lock", handleLock)
                .setActionCallback("unlock", handleUnlock)
                .setActionCallback("logout", handleLogout);
            const restoredSession = await (0, utils_1.getSavedSession)();
            if (restoredSession.token)
                bitwarden.setSessionToken(restoredSession.token);
            dispatch({ type: "loadSavedState", ...restoredSession });
            if (restoredSession.shouldLockVault)
                await bitwarden.lock(restoredSession.lockReason, true);
        }
        catch (error) {
            if (!(error instanceof errors_1.VaultIsLockedError))
                await bitwarden.lock();
            dispatch({ type: "failedLoadSavedState" });
            (0, development_1.captureException)("Failed to load saved session state", error);
        }
    }, bitwarden);
    async function handleUnlock(password, token) {
        const passwordHash = await (0, passwords_1.hashMasterPasswordForReprompting)(password);
        await utils_1.Storage.saveSession(token, passwordHash);
        dispatch({ type: "unlock", token, passwordHash });
    }
    async function handleLock(reason) {
        await utils_1.Storage.clearSession();
        dispatch({ type: "lock", lockReason: reason });
    }
    async function handleLogout() {
        await utils_1.Storage.clearSession();
        cache_1.Cache.clear();
        dispatch({ type: "logout" });
    }
    async function confirmMasterPassword(password) {
        const enteredPasswordHash = await (0, passwords_1.hashMasterPasswordForReprompting)(password);
        return enteredPasswordHash === state.passwordHash;
    }
    const contextValue = (0, react_1.useMemo)(() => ({
        token: state.token,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        isLocked: state.isLocked,
        active: !state.isLoading && state.isAuthenticated && !state.isLocked,
        confirmMasterPassword,
    }), [state, confirmMasterPassword]);
    if (state.isLoading)
        return (0, jsx_runtime_1.jsx)(api_1.List, { isLoading: true });
    const showUnlockForm = state.isLocked || !state.isAuthenticated;
    const children = state.token ? props.children : null;
    return ((0, jsx_runtime_1.jsx)(exports.SessionContext.Provider, { value: contextValue, children: showUnlockForm && props.unlock ? (0, jsx_runtime_1.jsx)(UnlockForm_1.default, { lockReason: state.lockReason }) : children }));
}
exports.SessionProvider = SessionProvider;
function useSession() {
    const session = (0, react_1.useContext)(exports.SessionContext);
    if (session == null) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return session;
}
exports.useSession = useSession;
