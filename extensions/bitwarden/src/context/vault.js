"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVault = exports.VaultProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const vaultListeners_1 = require("~/components/searchVault/context/vaultListeners");
const bitwarden_1 = require("~/context/bitwarden");
const session_1 = require("~/context/session");
const development_1 = require("~/utils/development");
const useVaultCaching_1 = __importDefault(require("~/components/searchVault/utils/useVaultCaching"));
const errors_1 = require("~/utils/errors");
const VaultContext = (0, react_1.createContext)(null);
const initialState = { items: [], folders: [], isLoading: true };
const VaultProvider = ({ children }) => {
    const session = (0, session_1.useSession)();
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const publishItems = (0, vaultListeners_1.useVaultItemPublisher)();
    const { getCachedVault, cacheVault } = (0, useVaultCaching_1.default)();
    const [state, setState] = (0, react_1.useReducer)((previous, next) => ({ ...previous, ...next }), { ...initialState, ...getCachedVault() });
    const isEmpty = state.items.length == 0;
    const isLoading = session.isLoading || state.isLoading;
    (0, react_1.useEffect)(() => {
        if (!session.active)
            return;
        if (session.token) {
            void loadItems();
        }
    }, [session.token, session.active]);
    async function loadItems() {
        try {
            let items = [];
            let folders = [];
            try {
                [items, folders] = await Promise.all([bitwarden.listItems(), bitwarden.listFolders()]);
                items.sort(favoriteItemsFirstSorter);
            }
            catch (error) {
                publishItems(new errors_1.FailedToLoadVaultItemsError());
                throw error;
            }
            setState({ items, folders });
            publishItems(items);
            cacheVault(items, folders);
        }
        catch (error) {
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, "Failed to load vault items", (0, errors_1.getDisplayableErrorMessage)(error));
            (0, development_1.captureException)("Failed to load vault items", error);
        }
        finally {
            setState({ isLoading: false });
        }
    }
    async function syncItems() {
        const toast = await (0, api_1.showToast)(api_1.Toast.Style.Animated, "Syncing Items...");
        try {
            await bitwarden.sync();
            await loadItems();
            await toast.hide();
        }
        catch (error) {
            await bitwarden.logout();
            toast.style = api_1.Toast.Style.Failure;
            toast.title = "Failed to sync. Please try logging in again.";
            toast.message = (0, errors_1.getDisplayableErrorMessage)(error);
        }
    }
    const memoizedValue = (0, react_1.useMemo)(() => ({ ...state, isEmpty, isLoading, syncItems }), [state, isEmpty, isLoading, syncItems]);
    return (0, jsx_runtime_1.jsx)(VaultContext.Provider, { value: memoizedValue, children: children });
};
exports.VaultProvider = VaultProvider;
function favoriteItemsFirstSorter(a, b) {
    if (a.favorite && b.favorite)
        return 0;
    return a.favorite ? -1 : 1;
}
const useVault = () => {
    const context = (0, react_1.useContext)(VaultContext);
    if (context == null) {
        throw new Error("useVault must be used within a VaultProvider");
    }
    return context;
};
exports.useVault = useVault;
