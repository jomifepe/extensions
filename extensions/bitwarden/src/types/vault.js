"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reprompt = exports.UriMatch = exports.FieldType = exports.ItemType = void 0;
var ItemType;
(function (ItemType) {
    ItemType[ItemType["LOGIN"] = 1] = "LOGIN";
    ItemType[ItemType["NOTE"] = 2] = "NOTE";
    ItemType[ItemType["CARD"] = 3] = "CARD";
    ItemType[ItemType["IDENTITY"] = 4] = "IDENTITY";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
var FieldType;
(function (FieldType) {
    FieldType[FieldType["TEXT"] = 0] = "TEXT";
    FieldType[FieldType["HIDDEN"] = 1] = "HIDDEN";
    FieldType[FieldType["BOOLEAN"] = 2] = "BOOLEAN";
    FieldType[FieldType["LINKED"] = 3] = "LINKED";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
var UriMatch;
(function (UriMatch) {
    UriMatch[UriMatch["BASE_DOMAIN"] = 0] = "BASE_DOMAIN";
    UriMatch[UriMatch["HOST"] = 1] = "HOST";
    UriMatch[UriMatch["STARTS_WITH"] = 2] = "STARTS_WITH";
    UriMatch[UriMatch["EXACT"] = 3] = "EXACT";
    UriMatch[UriMatch["REGULAR_EXPRESSION"] = 4] = "REGULAR_EXPRESSION";
    UriMatch[UriMatch["NEVER"] = 5] = "NEVER";
})(UriMatch = exports.UriMatch || (exports.UriMatch = {}));
var Reprompt;
(function (Reprompt) {
    Reprompt[Reprompt["NO"] = 0] = "NO";
    Reprompt[Reprompt["REQUIRED"] = 1] = "REQUIRED";
})(Reprompt = exports.Reprompt || (exports.Reprompt = {}));
