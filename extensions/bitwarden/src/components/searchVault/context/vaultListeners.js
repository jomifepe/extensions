"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVaultItemSubscriber = exports.useVaultItemPublisher = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const errors_1 = require("~/utils/errors");
const VaultListenersContext = (0, react_1.createContext)(null);
const VaultListenersProvider = ({ children }) => {
    const listeners = (0, react_1.useRef)(new Map());
    const publishItems = (itemsOrError) => {
        if (itemsOrError instanceof errors_1.FailedToLoadVaultItemsError) {
            listeners.current.forEach((listener) => listener(itemsOrError));
        }
        else {
            listeners.current.forEach((listener, itemId) => {
                const item = itemsOrError.find((item) => item.id === itemId);
                if (item)
                    listener(item);
            });
        }
    };
    const subscribeItem = (itemId, listener) => {
        listeners.current.set(itemId, listener);
        return () => {
            listeners.current.delete(itemId);
        };
    };
    const memoizedValue = (0, react_1.useMemo)(() => ({ listeners, publishItems, subscribeItem }), []);
    return (0, jsx_runtime_1.jsx)(VaultListenersContext.Provider, { value: memoizedValue, children: children });
};
const useVaultItemPublisher = () => {
    const context = (0, react_1.useContext)(VaultListenersContext);
    if (context == null)
        return () => null;
    return context.publishItems;
};
exports.useVaultItemPublisher = useVaultItemPublisher;
/** Allows you to subscribe to a specific item and get notified when it changes. */
const useVaultItemSubscriber = () => {
    const context = (0, react_1.useContext)(VaultListenersContext);
    if (context == null)
        throw new Error("useVaultItemSubscriber must be used within a VaultListenersProvider");
    return (itemId) => {
        let timeoutId;
        return new Promise((resolve, reject) => {
            const unsubscribe = context.subscribeItem(itemId, (itemOrError) => {
                try {
                    unsubscribe();
                    if (itemOrError instanceof errors_1.FailedToLoadVaultItemsError) {
                        throw itemOrError;
                    }
                    resolve(itemOrError);
                    clearTimeout(timeoutId);
                }
                catch (error) {
                    reject(error);
                }
            });
            timeoutId = setTimeout(() => {
                unsubscribe();
                reject(new SubscriberTimeoutError());
            }, 15000);
        });
    };
};
exports.useVaultItemSubscriber = useVaultItemSubscriber;
class SubscriberTimeoutError extends Error {
    constructor() {
        super("Timed out waiting for item");
        this.name = "SubscriberTimeoutError";
    }
}
exports.default = VaultListenersProvider;
