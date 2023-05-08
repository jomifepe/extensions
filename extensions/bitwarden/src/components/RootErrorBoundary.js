"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const TroubleshootingGuide_1 = __importDefault(require("~/components/TroubleshootingGuide"));
const errors_1 = require("~/utils/errors");
class RootErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    async componentDidCatch(error, errorInfo) {
        if (error instanceof errors_1.ManuallyThrownError) {
            this.setState((state) => ({ ...state, hasError: true, error: error.message }));
            await (0, api_1.showToast)(api_1.Toast.Style.Failure, error.message);
        }
        else {
            if (api_1.environment.isDevelopment) {
                this.setState((state) => ({ ...state, hasError: true, error: error.message }));
            }
            console.error("Error:", error, errorInfo);
        }
    }
    render() {
        try {
            if (this.state.hasError)
                return (0, jsx_runtime_1.jsx)(TroubleshootingGuide_1.default, { errorInfo: this.state.error });
            return this.props.children;
        }
        catch {
            return (0, jsx_runtime_1.jsx)(TroubleshootingGuide_1.default, {});
        }
    }
}
exports.default = RootErrorBoundary;
