"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const react_1 = require("react");
const general_1 = require("~/constants/general");
const useAbortController_1 = __importDefault(require("~/utils/hooks/useAbortController"));
const bitwarden_1 = require("~/context/bitwarden");
const passwords_1 = require("~/utils/passwords");
const initialPasswordGeneratorState = {
    options: undefined,
    password: undefined,
    isGenerating: true,
};
const passwordReducer = (state, action) => {
    switch (action.type) {
        case "generate":
            return { ...state, isGenerating: true };
        case "setPassword":
            return { ...state, password: action.password, isGenerating: false };
        case "setOptions":
            return { ...state, options: action.options };
        case "cancelGenerate":
            return { ...state, isGenerating: false };
        case "clearPassword":
            return { ...state, isGenerating: false, password: undefined };
    }
};
function usePasswordGenerator() {
    const bitwarden = (0, bitwarden_1.useBitwarden)();
    const [{ options, ...state }, dispatch] = (0, react_1.useReducer)(passwordReducer, initialPasswordGeneratorState);
    const { abortControllerRef, renew: renewAbortController, abort: abortPreviousGenerate } = (0, useAbortController_1.default)();
    const generatePassword = async (passwordOptions = options) => {
        try {
            renewAbortController();
            dispatch({ type: "generate" });
            const password = await bitwarden.generatePassword(passwordOptions, abortControllerRef?.current);
            dispatch({ type: "setPassword", password });
        }
        catch (error) {
            // generate password was likely aborted
            if (abortControllerRef?.current.signal.aborted) {
                dispatch({ type: "cancelGenerate" });
            }
        }
    };
    const regeneratePassword = async () => {
        if (state.isGenerating)
            return;
        await generatePassword();
    };
    const setOption = async (option, value) => {
        if (!options || options[option] === value)
            return;
        if (state.isGenerating) {
            abortPreviousGenerate();
        }
        const newOptions = { ...options, [option]: value };
        dispatch({ type: "setOptions", options: newOptions });
        await Promise.all([
            api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.PASSWORD_OPTIONS, JSON.stringify(newOptions)),
            generatePassword(newOptions),
        ]);
    };
    const restoreStoredOptions = async () => {
        const newOptions = await (0, passwords_1.getPasswordGeneratorOptions)();
        dispatch({ type: "setOptions", options: newOptions });
        await generatePassword(newOptions);
    };
    (0, react_1.useEffect)(() => {
        void restoreStoredOptions();
    }, []);
    return { ...state, regeneratePassword, options, setOption };
}
exports.default = usePasswordGenerator;
