"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockFolders = exports.getMockItems = void 0;
const faker_1 = require("@faker-js/faker");
const vault_1 = require("~/types/vault");
function getMockItems(count = 10, options) {
    const { sensitiveValue = faker_1.faker.random.alphaNumeric(10), overrideProps } = options || {};
    return [...Array(count)].map(() => ({
        object: "item",
        id: faker_1.faker.datatype.uuid(),
        organizationId: faker_1.faker.datatype.uuid(),
        folderId: faker_1.faker.datatype.uuid(),
        type: faker_1.faker.datatype.number({ min: 1, max: 4 }),
        reprompt: faker_1.faker.datatype.number({ min: 0, max: 1 }),
        name: faker_1.faker.random.words(2),
        favorite: faker_1.faker.datatype.boolean(),
        collectionIds: [faker_1.faker.datatype.uuid()],
        revisionDate: faker_1.faker.date.past().toISOString(),
        creationDate: faker_1.faker.date.past().toISOString(),
        deletedDate: null,
        secureNote: { type: faker_1.faker.datatype.number({ min: 0, max: 1 }) },
        notes: sensitiveValue,
        fields: [
            { name: faker_1.faker.random.words(2), value: sensitiveValue, type: vault_1.FieldType.HIDDEN, linkedId: null },
            { name: faker_1.faker.random.words(2), value: sensitiveValue, type: vault_1.FieldType.TEXT, linkedId: null },
            { name: faker_1.faker.random.words(2), value: sensitiveValue, type: vault_1.FieldType.BOOLEAN, linkedId: null },
            { name: faker_1.faker.random.words(2), value: sensitiveValue, type: vault_1.FieldType.LINKED, linkedId: null },
        ],
        login: {
            uris: [{ match: faker_1.faker.datatype.number({ min: 0, max: 5 }), uri: faker_1.faker.internet.url() }],
            username: faker_1.faker.internet.userName(),
            password: sensitiveValue,
            totp: sensitiveValue,
            passwordRevisionDate: sensitiveValue,
        },
        passwordHistory: [{ lastUsedDate: sensitiveValue, password: sensitiveValue }],
        card: {
            cardholderName: sensitiveValue,
            brand: sensitiveValue,
            number: sensitiveValue,
            expMonth: sensitiveValue,
            expYear: sensitiveValue,
            code: sensitiveValue,
        },
        identity: {
            firstName: sensitiveValue,
            middleName: sensitiveValue,
            lastName: sensitiveValue,
            address1: sensitiveValue,
            address2: sensitiveValue,
            address3: sensitiveValue,
            city: sensitiveValue,
            state: sensitiveValue,
            postalCode: sensitiveValue,
            country: sensitiveValue,
            company: sensitiveValue,
            email: sensitiveValue,
            phone: sensitiveValue,
            ssn: sensitiveValue,
            username: sensitiveValue,
            passportNumber: sensitiveValue,
            licenseNumber: sensitiveValue,
        },
        ...overrideProps,
    }));
}
exports.getMockItems = getMockItems;
function getMockFolders(count = 5) {
    return [...Array(count)].map(() => ({
        object: "folder",
        id: faker_1.faker.datatype.uuid(),
        name: faker_1.faker.random.words(2),
    }));
}
exports.getMockFolders = getMockFolders;
