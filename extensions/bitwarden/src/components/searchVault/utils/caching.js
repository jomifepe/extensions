"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareFoldersForCache = exports.prepareItemsForCache = void 0;
const general_1 = require("~/constants/general");
function prepareItemsForCache(items) {
    return items.map((item) => ({
        object: item.object,
        id: item.id,
        organizationId: item.organizationId,
        folderId: item.folderId,
        type: item.type,
        name: item.name,
        revisionDate: item.revisionDate,
        creationDate: item.creationDate,
        deletedDate: item.deletedDate,
        favorite: item.favorite,
        reprompt: item.reprompt,
        collectionIds: item.collectionIds,
        secureNote: item.secureNote ? { type: item.secureNote.type } : undefined,
        // sensitive data below
        fields: cleanFields(item.fields),
        login: cleanLogin(item.login),
        identity: cleanIdentity(item.identity),
        card: cleanCard(item.card),
        passwordHistory: cleanPasswordHistory(item.passwordHistory),
        notes: hideIfDefined(item.notes),
    }));
}
exports.prepareItemsForCache = prepareItemsForCache;
function prepareFoldersForCache(folders) {
    return folders.map((folder) => ({ object: folder.object, id: folder.id, name: folder.name }));
}
exports.prepareFoldersForCache = prepareFoldersForCache;
function cleanFields(fields) {
    return fields?.map((field) => ({
        name: field.name,
        value: hideIfDefined(field.value),
        type: field.type,
        linkedId: field.linkedId,
    }));
}
function cleanLogin(login) {
    if (!login)
        return undefined;
    return {
        username: login.username,
        uris: login.uris,
        password: hideIfDefined(login.password),
        passwordRevisionDate: hideIfDefined(login.passwordRevisionDate),
        totp: hideIfDefined(login.totp),
    };
}
function cleanIdentity(identity) {
    if (!identity)
        return undefined;
    return {
        firstName: hideIfDefined(identity.firstName),
        middleName: hideIfDefined(identity.middleName),
        lastName: hideIfDefined(identity.lastName),
        address1: hideIfDefined(identity.address1),
        address2: hideIfDefined(identity.address2),
        address3: hideIfDefined(identity.address3),
        city: hideIfDefined(identity.city),
        state: hideIfDefined(identity.state),
        postalCode: hideIfDefined(identity.postalCode),
        country: hideIfDefined(identity.country),
        company: hideIfDefined(identity.company),
        email: hideIfDefined(identity.email),
        phone: hideIfDefined(identity.phone),
        ssn: hideIfDefined(identity.ssn),
        username: hideIfDefined(identity.username),
        passportNumber: hideIfDefined(identity.passportNumber),
        licenseNumber: hideIfDefined(identity.licenseNumber),
    };
}
function cleanCard(card) {
    if (!card)
        return undefined;
    return {
        cardholderName: hideIfDefined(card.cardholderName),
        brand: hideIfDefined(card.brand),
        number: hideIfDefined(card.number),
        expMonth: hideIfDefined(card.expMonth),
        expYear: hideIfDefined(card.expYear),
        code: hideIfDefined(card.code),
    };
}
function cleanPasswordHistory(passwordHistoryItems) {
    return passwordHistoryItems?.map((passwordHistory) => ({
        password: hideIfDefined(passwordHistory.password),
        lastUsedDate: hideIfDefined(passwordHistory.lastUsedDate),
    }));
}
function hideIfDefined(value) {
    if (!value)
        return value;
    return general_1.SENSITIVE_VALUE_PLACEHOLDER;
}
