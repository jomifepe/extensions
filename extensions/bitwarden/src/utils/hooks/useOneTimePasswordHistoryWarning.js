"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@raycast/api");
const react_1 = require("react");
const general_1 = require("~/constants/general");
const useOneTimePasswordHistoryWarning = () => {
    const handleDismissAction = () => (0, api_1.popToRoot)({ clearSearchBar: false });
    const handlePrimaryAction = () => api_1.LocalStorage.setItem(general_1.LOCAL_STORAGE_KEY.PASSWORD_ONE_TIME_WARNING, true);
    const displayWarning = async () => {
        const alertWasShown = await api_1.LocalStorage.getItem(general_1.LOCAL_STORAGE_KEY.PASSWORD_ONE_TIME_WARNING);
        if (alertWasShown)
            return;
        await (0, api_1.confirmAlert)({
            title: "Warning",
            message: "Password history is not available yet, so make sure to store the password after generating it!",
            icon: api_1.Icon.ExclamationMark,
            dismissAction: {
                title: "Go back",
                onAction: handleDismissAction,
            },
            primaryAction: {
                title: "I understand",
                onAction: handlePrimaryAction,
            },
        });
    };
    (0, react_1.useEffect)(() => {
        void displayWarning();
    }, []);
};
exports.default = useOneTimePasswordHistoryWarning;
