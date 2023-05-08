"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const react_1 = require("react");
const ItemActionPanel_1 = __importDefault(require("~/components/searchVault/ItemActionPanel"));
const vaultItem_1 = __importDefault(require("~/components/searchVault/context/vaultItem"));
const search_1 = require("~/utils/search");
const { fetchFavicons } = (0, api_1.getPreferenceValues)();
const VaultItem = (props) => {
    const { item, folder } = props;
    const keywords = (0, react_1.useMemo)(() => (0, search_1.extractKeywords)(item), [item]);
    return ((0, jsx_runtime_1.jsx)(vaultItem_1.default.Provider, { value: item, children: (0, jsx_runtime_1.jsx)(api_1.List.Item, { id: item.id, title: item.name, keywords: keywords, accessories: getAccessories(item, folder), icon: getIcon(item), subtitle: item.login?.username || undefined, actions: (0, jsx_runtime_1.jsx)(ItemActionPanel_1.default, {}) }) }));
};
const ITEM_TYPE_TO_ICON_MAP = {
    1: api_1.Icon.Globe,
    2: api_1.Icon.BlankDocument,
    3: api_1.Icon.List,
    4: api_1.Icon.Person,
};
function getIcon(item) {
    const iconUri = item.login?.uris?.[0]?.uri;
    if (fetchFavicons && iconUri)
        return (0, search_1.faviconUrl)(iconUri);
    return ITEM_TYPE_TO_ICON_MAP[item.type];
}
function getAccessories(item, folder) {
    const accessories = [];
    if (folder?.id) {
        accessories.push({
            icon: { source: api_1.Icon.Folder, tintColor: api_1.Color.SecondaryText },
            tooltip: "Folder",
            text: folder.name,
        });
    }
    if (item.favorite) {
        accessories.push({ icon: { source: api_1.Icon.Star, tintColor: api_1.Color.Yellow }, tooltip: "Favorite" });
    }
    return accessories;
}
exports.default = VaultItem;
