"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelectedVaultItem = void 0;
const react_1 = require("react");
const VaultItemContext = (0, react_1.createContext)(null);
const useSelectedVaultItem = () => {
    const session = (0, react_1.useContext)(VaultItemContext);
    if (session == null) {
        throw new Error("useSelectVaultItem must be used within a VaultItemContext.Provider");
    }
    return session;
};
exports.useSelectedVaultItem = useSelectedVaultItem;
exports.default = VaultItemContext;
