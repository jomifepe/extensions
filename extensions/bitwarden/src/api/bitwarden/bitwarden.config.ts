import { Cache, environment } from "@raycast/api";
import { execaSync } from "execa";
import { existsSync } from "fs";
import { join } from "path";
import { getFileSha256 } from "~/utils/crypto";

import type { BwCommands } from "./bitwarden.types";
import { BinDownloadLogger } from "./bitwarden.helpers";

type CommandArgs = string[] | ((...args: any[]) => string[]);

export const cliInfo = {
  version: "2024.4.0",
  sha256: "db23024b6108458870494ab889c63d9a4ec60fbc620525e40cdadeeea58c50a4",
  downloadPage: "https://github.com/bitwarden/clients/releases",
  path: {
    arm64: "/opt/homebrew/bin/bw",
    x64: "/usr/local/bin/bw",
    get downloadedBin() {
      return join(environment.supportPath, cliInfo.binFilename);
    },
    get installedBin() {
      return process.arch === "arm64" ? this.arm64 : this.x64;
    },
    get bin() {
      // TODO: Remove this when the issue is resolved
      // CLI bin download is off for arm64 until bitwarden releases arm binaries
      // https://github.com/bitwarden/clients/pull/2976
      // https://github.com/bitwarden/clients/pull/7338
      if (process.arch === "arm64") {
        const cache = new Cache();
        try {
          if (!existsSync(this.downloadedBin)) throw new Error("No downloaded bin");
          if (cache.get("downloadedBinWorks") === "true") return this.downloadedBin;

          execaSync(this.downloadedBin, ["--version"]);
          cache.set("downloadedBinWorks", "true");
          return this.downloadedBin;
        } catch {
          cache.set("downloadedBinWorks", "false");
          return this.installedBin;
        }
      }

      return !BinDownloadLogger.hasError() ? this.downloadedBin : this.installedBin;
    },
  },
  get binFilename() {
    return `bw-${this.version}`;
  },
  get downloadUrl() {
    return `${this.downloadPage}/download/cli-v${this.version}/bw-macos-${this.version}.zip`;
  },
  checkHashMatchesFile: function (filePath: string) {
    return getFileSha256(filePath) === this.sha256;
  },
} as const;

export const BwCommand = {
  checkServerUrl: (url: string) => ["config", "server", url],
  login: ["login", "--apikey"],
  logout: ["logout"],
  lock: ["lock"],
  unlock: (password: string) => ["unlock", password, "--raw"],
  sync: ["sync"],
  getItem: (id: string) => ["get", "item", id],
  listItems: ["list", "items"],
  listFolders: ["list", "folders"],
  createFolder: (encodedFolder: string) => ["create", "folder", encodedFolder],
  getTotp: (id: string) => ["get", "totp", id],
  status: ["status"],
  checkLockStatus: ["unlock", "--check"],
  getTemplate: (type: string) => ["get", "template", type],
  encode: ["encode"],
  generatePassword: (...args: string[]) => ["generate", ...args],
  listSends: ["send", "list"],
  createSend: (encodedPayload: string) => ["send", "create", encodedPayload],
  editSend: (encodedPayload: string) => ["send", "edit", encodedPayload],
  deleteSend: (id: string) => ["send", "delete", id],
  removeSendPassword: (id: string) => ["send", "remove-password", id],
  receiveSendInfo: (url: string) => ["send", "receive", url, "--obj"],
  receiveSend: (url: string, path?: string) => ["send", "receive", url, ...(path ? ["--output", path] : [])],
} as const satisfies Record<keyof BwCommands, CommandArgs>;
