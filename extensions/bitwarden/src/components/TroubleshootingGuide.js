"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const api_1 = require("@raycast/api");
const CODE_BACKTICKS = "```";
const BW_CLI_INSTALLATION_DOCS_URL = "https://bitwarden.com/help/cli/#download-and-install";
const BW_CLI_HOMEBREW_DOCS_URL = "https://formulae.brew.sh/formula/bitwarden-cli";
const GITHUB_CREATE_ISSUE_URL = "https://github.com/raycast/extensions/issues/new?assignees=&labels=extension%2Cbug&template=extension_bug_report.yml&title=%5BBitwarden%5D+...";
const getContent = (errorInfo) => `# 🚨 Something went wrong
${errorInfo ? `${CODE_BACKTICKS}\n${errorInfo}\n${CODE_BACKTICKS}` : "\n"}
## Troubleshooting Guide:

1. The [Bitwarden CLI](${BW_CLI_INSTALLATION_DOCS_URL}) is correctly installed
2. If you did not install the Bitwarden CLI [using Homebrew](${BW_CLI_HOMEBREW_DOCS_URL}), please check that the path of the installation matches the \`Bitwarden CLI Installation Path\` extension setting. 
    - 💡 Run the \`which bw\` command to check the CLI installation path.

If you are still experiencing issues, please [open an issue on GitHub](${GITHUB_CREATE_ISSUE_URL}).
`;
const TroubleshootingGuide = (props) => ((0, jsx_runtime_1.jsx)(api_1.Detail, { markdown: getContent(props.errorInfo), actions: (0, jsx_runtime_1.jsxs)(api_1.ActionPanel, { children: [(0, jsx_runtime_1.jsx)(api_1.Action.CopyToClipboard, { title: "Copy Homebrew Installation Command", content: "brew install bitwarden-cli" }), (0, jsx_runtime_1.jsx)(api_1.Action.OpenInBrowser, { title: "Open Installation Guide", url: BW_CLI_INSTALLATION_DOCS_URL })] }) }));
exports.default = TroubleshootingGuide;
