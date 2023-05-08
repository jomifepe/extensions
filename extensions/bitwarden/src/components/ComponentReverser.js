"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ComponentReverser = (props) => {
    const children = react_1.Children.toArray(props.children);
    if (props.reverse)
        children.reverse();
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
};
exports.default = ComponentReverser;
