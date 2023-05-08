"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBitwarden = exports.BitwardenProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const bitwarden_1 = require("~/api/bitwarden");
const BitwardenContext = (0, react_1.createContext)(null);
const BitwardenProvider = (props) => {
    const { children } = props;
    const [bitwarden, setBitwarden] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        void new bitwarden_1.Bitwarden().initialize().then(setBitwarden);
    }, []);
    if (!bitwarden)
        return (0, jsx_runtime_1.jsx)(api_1.Detail, { isLoading: true });
    return (0, jsx_runtime_1.jsx)(BitwardenContext.Provider, { value: bitwarden, children: children });
};
exports.BitwardenProvider = BitwardenProvider;
const useBitwarden = () => {
    const context = (0, react_1.useContext)(BitwardenContext);
    if (context == null) {
        throw new Error("useBitwarden must be used within a BitwardenProvider");
    }
    return context;
};
exports.useBitwarden = useBitwarden;
exports.default = BitwardenContext;
