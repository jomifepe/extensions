import { environment, getPreferenceValues, LocalStorage, open, showToast, Toast } from "@raycast/api";
import { execa, ExecaChildProcess, ExecaError, ExecaReturnValue } from "execa";
import { existsSync } from "fs";
import { dirname } from "path/posix";
import { LOCAL_STORAGE_KEY, DEFAULT_SERVER_URL } from "~/constants/general";
import { VaultState, VaultStatus } from "~/types/general";
import { PasswordGeneratorOptions } from "~/types/passwords";
import { Folder, Item } from "~/types/vault";
import { getPasswordGeneratingArgs } from "~/utils/passwords";
import { getServerUrlPreference } from "~/utils/preferences";
import { EnsureCliBinError, CLINotFoundError, VaultIsLockedError } from "~/utils/errors";
import { join } from "path";
import { chmod, rename, rm } from "fs/promises";
import { decompressFile, removeFilesThatStartWith, waitForFileAvailable } from "~/utils/fs";
import { getFileSha256 } from "~/utils/crypto";

const cliInfo = {
  version: "2023.8.2",
  sha256: "9bd011ef98bee098206a6242f7e4f5ed923062ea6eefaee28015c3616a90d166",
  downloadPage: "https://github.com/bitwarden/clients/releases",
  getBinFilename: function () {
    return `bw-${this.version}`;
  },
  getDownloadUrl: function () {
    return `${this.downloadPage}/download/cli-v${this.version}/bw-macos-${this.version}.zip`;
  },
  checkHashMatchesFile: async function (filePath: string) {
    return (await getFileSha256(filePath)) === this.sha256;
  },
};

export class Bitwarden {
  private env: Env;
  private initPromise: Promise<void>;
  private tempSessionToken?: string;
  private callbacks: ActionCallbacks = {};
  lockReason: string | undefined;
  cliPath: string;

  constructor() {
    const { cliPath, clientId, clientSecret, serverCertsPath } = getPreferenceValues<Preferences>();
    const serverUrl = getServerUrlPreference();

    if (cliPath) {
      if (!existsSync(cliPath)) throw new CLINotFoundError(`Bitwarden CLI not found at ${cliPath}`);
      this.cliPath = cliPath;
    } else {
      this.cliPath = join(environment.supportPath, cliInfo.getBinFilename());
    }

    this.env = {
      BITWARDENCLI_APPDATA_DIR: environment.supportPath,
      BW_CLIENTSECRET: clientSecret.trim(),
      BW_CLIENTID: clientId.trim(),
      PATH: dirname(process.execPath),
      ...(serverUrl && serverCertsPath ? { NODE_EXTRA_CA_CERTS: serverCertsPath } : {}),
    };

    this.initPromise = (async () => {
      await this.ensureCliBinary();
      await this.checkServerUrl(serverUrl);
      this.lockReason = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON);
    })();
  }

  private async ensureCliBinary() {
    if (existsSync(this.cliPath)) return;
    const { supportPath } = environment;
    // remove old binaries to check if it's an update and because they are 100MB+
    const hadOldBinaries = await removeFilesThatStartWith("bw-", supportPath);

    const toast = await showToast({
      title: `${hadOldBinaries ? "Updating" : "Initializing"} Bitwarden CLI`,
      style: Toast.Style.Animated,
      primaryAction: { title: "Open Download Page", onAction: () => open(cliInfo.downloadPage) },
    });
    const zipPath = join(supportPath, "bw.zip");
    try {
      try {
        toast.message = "Downloading...";
        await execa("curl", [cliInfo.getDownloadUrl(), "-Lo", zipPath]);
        const isValidFile = await cliInfo.checkHashMatchesFile(zipPath);
        if (!isValidFile) throw new EnsureCliBinError("File hash does not match");
      } catch (downloadError) {
        toast.title = "Failed to download Bitwarden CLI";
        throw downloadError;
      }
      try {
        toast.message = "Extracting...";
        await decompressFile(zipPath, supportPath);
        const decompressedBinPath = join(supportPath, "bw");
        await waitForFileAvailable(decompressedBinPath);
        await rename(decompressedBinPath, this.cliPath);
        await chmod(this.cliPath, "755");
        await rm(zipPath, { force: true });
      } catch (extractError) {
        toast.title = "Failed to extract Bitwarden CLI";
        throw extractError;
      }
      await toast.hide();
    } catch (error) {
      toast.message = error instanceof EnsureCliBinError ? error.message : "Please try again";
      toast.style = Toast.Style.Failure;
      await execa("rm", ["-rf", zipPath, this.cliPath]);
      throw error;
    }
  }

  setActionCallback<TAction extends keyof ActionCallbacks>(action: TAction, callback: ActionCallbacks[TAction]): this {
    this.callbacks[action] = callback;
    return this;
  }

  setSessionToken(token: string): void {
    this.env = {
      ...this.env,
      BW_SESSION: token,
    };
  }

  clearSessionToken(): void {
    delete this.env.BW_SESSION;
  }

  withSession(token: string): this {
    this.tempSessionToken = token;
    return this;
  }

  async initialize(): Promise<this> {
    await this.initPromise;
    return this;
  }

  async checkServerUrl(serverUrl: string): Promise<void> {
    // Check the CLI has been configured to use the preference Url
    const cliServer = (await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY.SERVER_URL)) || "";
    if (cliServer === serverUrl) return;

    // Update the server Url
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Switching server...",
      message: "Bitwarden server preference changed",
    });
    try {
      try {
        await this.logout();
      } catch {
        // It doesn't matter if we weren't logged in.
      }
      // If URL is empty, set it to the default
      await this.exec(["config", "server", serverUrl || DEFAULT_SERVER_URL]);
      await LocalStorage.setItem(LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);

      toast.style = Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Bitwarden server changed";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to switch server";
      if (error instanceof Error) {
        toast.message = error.message;
      } else {
        toast.message = "Unknown error occurred";
      }
    }
  }

  private async setLockReason(reason: string) {
    this.lockReason = reason;
    await LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON, reason);
  }

  private async clearLockReason(): Promise<void> {
    if (this.lockReason) {
      await LocalStorage.removeItem(LOCAL_STORAGE_KEY.VAULT_LOCK_REASON);
      this.lockReason = undefined;
    }
  }

  private async exec(args: string[], options?: ExecProps): Promise<ExecaChildProcess> {
    const { abortController, input = "", skipLastActivityUpdate = false } = options ?? {};
    let env = this.env;
    if (this.tempSessionToken) env = { ...env, BW_SESSION: this.tempSessionToken };
    const result = await execa(this.cliPath, args, { env, input, signal: abortController?.signal });

    if (!skipLastActivityUpdate) {
      await LocalStorage.setItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, new Date().toISOString());
    }
    if (this.tempSessionToken) {
      this.tempSessionToken = undefined;
    }
    if (this.isPromptWaitingForMasterPassword(result)) {
      /* since we have the session token in the env, the password 
      should not be requested, unless the vault is locked */
      await this.lock();
      throw new VaultIsLockedError();
    }

    return result;
  }

  async sync(): Promise<void> {
    await this.exec(["sync"]);
  }

  async login(): Promise<void> {
    await this.exec(["login", "--apikey"]);
    await this.clearLockReason();
    await this.callbacks.login?.();
  }

  async logout(): Promise<void> {
    await this.exec(["logout"]);
    this.clearSessionToken();
    await this.callbacks.logout?.();
  }

  async lock(reason?: string, shouldCheckVaultStatus?: boolean): Promise<void> {
    if (shouldCheckVaultStatus) {
      const isAuthenticated = (await this.status()).status !== "unauthenticated";
      if (!isAuthenticated) return;
    }

    if (reason) await this.setLockReason(reason);
    await this.exec(["lock"]);
    await this.callbacks.lock?.(reason);
  }

  async unlock(password: string): Promise<string> {
    const { stdout: sessionToken } = await this.exec(["unlock", password, "--raw"]);
    this.setSessionToken(sessionToken);
    await this.clearLockReason();
    await this.callbacks.unlock?.(password, sessionToken);
    return sessionToken;
  }

  async listItems(): Promise<Item[]> {
    const { stdout } = await this.exec(["list", "items"]);
    const items = JSON.parse<Item[]>(stdout);
    // Filter out items without a name property (they are not displayed in the bitwarden app)
    return items.filter((item: Item) => !!item.name);
  }

  async listFolders(): Promise<Folder[]> {
    const { stdout } = await this.exec(["list", "folders"]);
    return JSON.parse<Folder[]>(stdout);
  }

  async getTotp(id: string): Promise<string> {
    // this could return something like "Not found." but checks for totp code are done before calling this function
    const { stdout } = await this.exec(["get", "totp", id]);
    return stdout;
  }

  async status(): Promise<VaultState> {
    const { stdout } = await this.exec(["status"]);
    return JSON.parse(stdout);
  }

  async checkLockStatus(): Promise<VaultStatus> {
    try {
      await this.exec(["unlock", "--check"]);
      return "unlocked";
    } catch (error) {
      const errorMessage = (error as ExecaError).stderr;
      if (errorMessage === "Vault is locked.") return "locked";
      return "unauthenticated";
    }
  }

  async generatePassword(options?: PasswordGeneratorOptions, abortController?: AbortController): Promise<string> {
    const args = options ? getPasswordGeneratingArgs(options) : [];
    const { stdout } = await this.exec(["generate", ...args], { abortController });
    return stdout;
  }

  private isPromptWaitingForMasterPassword(result: ExecaReturnValue): boolean {
    return !!(result.stderr && result.stderr.includes("Master password"));
  }
}

type Env = {
  BITWARDENCLI_APPDATA_DIR: string;
  BW_CLIENTSECRET: string;
  BW_CLIENTID: string;
  PATH: string;
  NODE_EXTRA_CA_CERTS?: string;
  BW_SESSION?: string;
};

type ActionCallbacks = {
  login?: () => MaybePromise<void>;
  logout?: () => MaybePromise<void>;
  lock?: (reason?: string) => MaybePromise<void>;
  unlock?: (password: string, sessionToken: string) => MaybePromise<void>;
};

type ExecProps = {
  abortController?: AbortController;
  skipLastActivityUpdate?: boolean;
  input?: string;
};
