import { environment, getPreferenceValues, LocalStorage, open, showToast, Toast } from "@raycast/api";
import { execa, ExecaChildProcess, ExecaError, ExecaReturnValue } from "execa";
import { accessSync, chmodSync, constants, existsSync } from "fs";
import { chmod, rename, rm } from "fs/promises";
import { join } from "path";
import { dirname } from "path/posix";

import { DEFAULT_SERVER_URL, LOCAL_STORAGE_KEY } from "~/constants/general";
import { VaultState, VaultStatus } from "~/types/general";
import { PasswordGeneratorOptions } from "~/types/passwords";
import { ReceivedSend, Send, SendCreatePayload, SendType } from "~/types/send";
import { Folder, Item } from "~/types/vault";
import { captureException } from "~/utils/development";
import {
  EnsureCliBinError,
  InstalledCLINotFoundError,
  ManuallyThrownError,
  NotLoggedInError,
  PremiumFeatureError,
  SendInvalidPasswordError,
  SendNeedsPasswordError,
  VaultIsLockedError,
} from "~/utils/errors";
import { decompressFile, removeFilesThatStartWith, unlinkAllSync, waitForFileAvailable } from "~/utils/fs";
import { download } from "~/utils/network";
import { getPasswordGeneratingArgs } from "~/utils/passwords";
import { getServerUrlPreference } from "~/utils/preferences";

import { BwCommand, cliInfo } from "./bitwarden.config";
import { BinDownloadLogger, prepareCommandError, prepareSendPayload } from "./bitwarden.helpers";
import type {
  BwCommands,
  BwActionListeners,
  BwActionListenersMap,
  BwEnv,
  BwExecProps,
  BwLockOptions,
  BwLogoutOptions,
  BwReceiveSendOptions,
  MaybeError,
} from "./bitwarden.types";

const { supportPath } = environment;

export class Bitwarden implements BwCommands {
  private env: BwEnv;
  private initPromise: Promise<void>;
  private tempSessionToken?: string;
  private actionListeners: BwActionListenersMap = new Map();
  private preferences = getPreferenceValues<Preferences>();
  private cliPath: string;
  private toastInstance: Toast | undefined;
  wasCliUpdated = false;

  constructor(toastInstance?: Toast) {
    const { cliPath: cliPathPreference, clientId, clientSecret, serverCertsPath } = this.preferences;
    const serverUrl = getServerUrlPreference();

    this.toastInstance = toastInstance;
    this.cliPath = cliPathPreference || cliInfo.path.bin;
    this.env = {
      BITWARDENCLI_APPDATA_DIR: supportPath,
      BW_CLIENTSECRET: clientSecret.trim(),
      BW_CLIENTID: clientId.trim(),
      PATH: dirname(process.execPath),
      ...(serverUrl && serverCertsPath ? { NODE_EXTRA_CA_CERTS: serverCertsPath } : {}),
    };

    this.initPromise = (async (): Promise<void> => {
      await this.ensureCliBinary();
      await this.checkServerUrl(serverUrl);
    })();
  }

  private async ensureCliBinary(): Promise<void> {
    if (this.checkCliBinIsReady(this.cliPath)) return;
    if (this.cliPath === this.preferences.cliPath || this.cliPath === cliInfo.path.installedBin) {
      throw new InstalledCLINotFoundError(`Bitwarden CLI not found at ${this.cliPath}`);
    }
    if (BinDownloadLogger.hasError()) BinDownloadLogger.clearError();

    // remove old binaries to check if it's an update and because they are 100MB+
    const hadOldBinaries = await removeFilesThatStartWith("bw-", supportPath);
    const toast = await this.showToast({
      title: `${hadOldBinaries ? "Updating" : "Initializing"} Bitwarden CLI`,
      style: Toast.Style.Animated,
      primaryAction: { title: "Open Download Page", onAction: () => open(cliInfo.downloadPage) },
    });
    const tmpFileName = "bw.zip";
    const zipPath = join(supportPath, tmpFileName);

    try {
      try {
        toast.message = "Downloading...";
        await download(cliInfo.downloadUrl, zipPath, (percent) => (toast.message = `Downloading ${percent}%`));
        if (!cliInfo.checkHashMatchesFile(zipPath)) throw new EnsureCliBinError("Binary hash does not match");
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
        this.wasCliUpdated = true;
      } catch (extractError) {
        toast.title = "Failed to extract Bitwarden CLI";
        throw extractError;
      }
      await toast.hide();
    } catch (error) {
      toast.message = error instanceof EnsureCliBinError ? error.message : "Please try again";
      toast.style = Toast.Style.Failure;
      unlinkAllSync(zipPath, this.cliPath);
      BinDownloadLogger.logError(error);

      if (error instanceof Error) throw new EnsureCliBinError(`${error.name}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await toast.restore();
    }
  }

  private checkCliBinIsReady(filePath: string): boolean {
    try {
      if (!existsSync(this.cliPath)) return false;
      accessSync(filePath, constants.X_OK);
      return true;
    } catch {
      chmodSync(filePath, "755");
      return true;
    }
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

  async checkServerUrl(url: string): Promise<MaybeError> {
    // Check the CLI has been configured to use the preference Url
    const cliServer = (await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY.SERVER_URL)) || "";
    if (cliServer === url) return { result: undefined };
    const serverUrl = url || DEFAULT_SERVER_URL;

    // Update the server Url
    const toast = await this.showToast({
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
      await this.exec(BwCommand.checkServerUrl(serverUrl), { resetVaultTimeout: false });
      await LocalStorage.setItem(LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);

      toast.style = Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Bitwarden server changed";

      return { result: undefined };
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to switch server";
      if (error instanceof Error) {
        toast.message = error.message;
      } else {
        toast.message = "Unknown error occurred";
      }
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Check Server URL", error, [serverUrl]);
    } finally {
      await toast.restore();
    }
  }

  private async exec(args: string[], options: BwExecProps): Promise<ExecaChildProcess> {
    const { abortController, input = "", resetVaultTimeout } = options ?? {};

    let env = this.env;
    if (this.tempSessionToken) {
      env = { ...env, BW_SESSION: this.tempSessionToken };
      this.tempSessionToken = undefined;
    }

    const result = await execa(this.cliPath, args, { input, env, signal: abortController?.signal });

    if (this.isPromptWaitingForMasterPassword(result)) {
      /* since we have the session token in the env, the password 
      should not be requested, unless the vault is locked */
      await this.lock();
      throw new VaultIsLockedError();
    }

    if (resetVaultTimeout) {
      await LocalStorage.setItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, new Date().toISOString());
    }

    return result;
  }

  async login(): Promise<MaybeError> {
    try {
      await this.exec(BwCommand.login, { resetVaultTimeout: true });
      await this.saveLastVaultStatus("login", "unlocked");
      await this.callActionListeners("login");
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Login", error);
    }
  }

  async logout(options?: BwLogoutOptions): Promise<MaybeError> {
    const { reason, immediate = false } = options ?? {};
    try {
      if (immediate) await this.handlePostLogout(reason);

      await this.exec(BwCommand.logout, { resetVaultTimeout: false });
      await this.saveLastVaultStatus("logout", "unauthenticated");
      if (!immediate) await this.handlePostLogout(reason);
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Logout", error);
    }
  }

  async lock(options?: BwLockOptions): Promise<MaybeError> {
    const { reason, checkVaultStatus = false, immediate = false } = options ?? {};
    try {
      if (immediate) await this.callActionListeners("lock", reason);
      if (checkVaultStatus) {
        const { error, result } = await this.status();
        if (error) throw error;
        if (result.status === "unauthenticated") return { error: new NotLoggedInError("Not logged in") };
      }

      await this.exec(BwCommand.lock, { resetVaultTimeout: false });
      await this.saveLastVaultStatus("lock", "locked");
      if (!immediate) await this.callActionListeners("lock", reason);
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Lock", error);
    }
  }

  async unlock(password: string): Promise<MaybeError<string>> {
    try {
      const { stdout: sessionToken } = await this.exec(BwCommand.unlock(password), { resetVaultTimeout: true });
      this.setSessionToken(sessionToken);
      await this.saveLastVaultStatus("unlock", "unlocked");
      await this.callActionListeners("unlock", password, sessionToken);
      return { result: sessionToken };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Unlock", error, password);
    }
  }

  async sync(): Promise<MaybeError> {
    try {
      await this.exec(BwCommand.sync, { resetVaultTimeout: true });
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Sync", error);
    }
  }

  async getItem(id: string): Promise<MaybeError<Item>> {
    try {
      const { stdout } = await this.exec(BwCommand.getItem(id), { resetVaultTimeout: true });
      return { result: JSON.parse<Item>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Failed to get item", error, [id]);
    }
  }

  async listItems(): Promise<MaybeError<Item[]>> {
    try {
      const { stdout } = await this.exec(BwCommand.listItems, { resetVaultTimeout: true });
      const items = JSON.parse<Item[]>(stdout);
      // Filter out items without a name property (they are not displayed in the bitwarden app)
      return { result: items.filter((item: Item) => !!item.name) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("List Items", error);
    }
  }

  async listFolders(): Promise<MaybeError<Folder[]>> {
    try {
      const { stdout } = await this.exec(BwCommand.listFolders, { resetVaultTimeout: true });
      return { result: JSON.parse<Folder[]>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("List Folders", error);
    }
  }

  async createFolder(name: string): Promise<MaybeError> {
    try {
      const { error, result: folder } = await this.getTemplate("folder");
      if (error) throw error;

      folder.name = name;
      const { result: encodedFolder, error: encodeError } = await this.encode(JSON.stringify(folder));
      if (encodeError) throw encodeError;

      await this.exec(BwCommand.createFolder(encodedFolder), { resetVaultTimeout: true });
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Create Folder", error, [name]);
    }
  }

  async getTotp(id: string): Promise<MaybeError<string>> {
    try {
      // this could return something like "Not found." but checks for totp code are done before calling this function
      const { stdout } = await this.exec(BwCommand.getTotp(id), { resetVaultTimeout: true });
      return { result: stdout };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Get TOTP", error, [id]);
    }
  }

  async status(): Promise<MaybeError<VaultState>> {
    try {
      const { stdout } = await this.exec(BwCommand.status, { resetVaultTimeout: false });
      return { result: JSON.parse<VaultState>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Status", error);
    }
  }

  async checkLockStatus(): Promise<VaultStatus> {
    try {
      await this.exec(BwCommand.checkLockStatus, { resetVaultTimeout: false });
      await this.saveLastVaultStatus("checkLockStatus", "unlocked");
      return "unlocked";
    } catch (error) {
      const errorMessage = (error as ExecaError).stderr;
      if (errorMessage === "Vault is locked.") {
        await this.saveLastVaultStatus("checkLockStatus", "locked");
        return "locked";
      }
      await this.saveLastVaultStatus("checkLockStatus", "unauthenticated");
      return "unauthenticated";
    }
  }

  async getTemplate<T = any>(type: string): Promise<MaybeError<T>> {
    try {
      const { stdout } = await this.exec(BwCommand.getTemplate(type), { resetVaultTimeout: true });
      return { result: JSON.parse<T>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Get Template", error);
    }
  }

  async encode(input: string): Promise<MaybeError<string>> {
    try {
      const { stdout } = await this.exec(BwCommand.encode, { input, resetVaultTimeout: false });
      return { result: stdout };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Encode", error, [input]);
    }
  }

  async generatePassword(
    options?: PasswordGeneratorOptions,
    abortController?: AbortController
  ): Promise<MaybeError<string>> {
    try {
      const args = options ? getPasswordGeneratingArgs(options) : [];
      const { stdout } = await this.exec(BwCommand.generatePassword(...args), {
        abortController,
        resetVaultTimeout: false,
      });
      return { result: stdout };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Generate Password", error);
    }
  }

  async listSends(): Promise<MaybeError<Send[]>> {
    try {
      const { stdout } = await this.exec(BwCommand.listSends, { resetVaultTimeout: true });
      return { result: JSON.parse<Send[]>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Send List", error);
    }
  }

  async createSend(values: SendCreatePayload): Promise<MaybeError<Send>> {
    let commandPayload: string | undefined;
    try {
      const { error: templateError, result: template } = await this.getTemplate(
        values.type === SendType.Text ? "send.text" : "send.file"
      );
      if (templateError) throw templateError;

      const payload = prepareSendPayload(template, values);
      const { result: encodedPayload, error: encodeError } = await this.encode(JSON.stringify(payload));
      if (encodeError) throw encodeError;
      commandPayload = encodedPayload;

      const { stdout } = await this.exec(BwCommand.createSend(encodedPayload), { resetVaultTimeout: true });

      return { result: JSON.parse<Send>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Send Create", error, [commandPayload]);
    }
  }

  async editSend(values: SendCreatePayload): Promise<MaybeError<Send>> {
    let commandPayload: string | undefined;
    try {
      const { result: encodedPayload, error: encodeError } = await this.encode(JSON.stringify(values));
      if (encodeError) throw encodeError;
      commandPayload = encodedPayload;

      const { stdout } = await this.exec(BwCommand.editSend(encodedPayload), { resetVaultTimeout: true });
      return { result: JSON.parse<Send>(stdout) };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Failed to delete send", error, [commandPayload]);
    }
  }

  async deleteSend(id: string): Promise<MaybeError> {
    try {
      await this.exec(BwCommand.deleteSend(id), { resetVaultTimeout: true });
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Send Delete", error, [id]);
    }
  }

  async removeSendPassword(id: string): Promise<MaybeError> {
    try {
      await this.exec(BwCommand.removeSendPassword(id), { resetVaultTimeout: true });
      return { result: undefined };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Send Remove Password", error, [id]);
    }
  }

  async receiveSendInfo(url: string, options?: BwReceiveSendOptions): Promise<MaybeError<ReceivedSend>> {
    const { password } = options ?? {};
    try {
      const { stdout, stderr } = await this.exec(BwCommand.receiveSendInfo(url), {
        resetVaultTimeout: true,
        input: password,
      });
      if (!stdout && /Invalid password/i.test(stderr)) return { error: new SendInvalidPasswordError() };
      if (!stdout && /Send password/i.test(stderr)) return { error: new SendNeedsPasswordError() };

      return { result: JSON.parse<ReceivedSend>(stdout) };
    } catch (error) {
      const errorMessage = (error as ExecaError).stderr;
      if (/Invalid password/gi.test(errorMessage)) return { error: new SendInvalidPasswordError() };
      if (/Send password/gi.test(errorMessage)) return { error: new SendNeedsPasswordError() };

      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Send Receive Info/Obj", error, [url, password]);
    }
  }

  async receiveSend(url: string, options?: BwReceiveSendOptions): Promise<MaybeError<string>> {
    const { savePath, password } = options ?? {};
    try {
      const { stdout } = await this.exec(BwCommand.receiveSend(url, savePath), {
        resetVaultTimeout: true,
        input: password,
      });
      return { result: stdout };
    } catch (error) {
      const { handledError } = await this.handleCommonErrors(error);
      if (handledError) return { error: handledError };
      throw prepareCommandError("Send Receive", error, [url, password]);
    }
  }

  // utils below

  async saveLastVaultStatus(callName: string, status: VaultStatus): Promise<void> {
    await LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS, status);
  }

  async getLastSavedVaultStatus(): Promise<VaultStatus | undefined> {
    const lastSavedStatus = await LocalStorage.getItem<VaultStatus>(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS);
    if (!lastSavedStatus) {
      const vaultStatus = await this.status();
      return vaultStatus.result?.status;
    }
    return lastSavedStatus;
  }

  private isPromptWaitingForMasterPassword(result: ExecaReturnValue): boolean {
    return !!(result.stderr && result.stderr.includes("Master password"));
  }

  private async handlePostLogout(reason?: string): Promise<void> {
    this.clearSessionToken();
    await this.callActionListeners("logout", reason);
  }

  private async handleCommonErrors(error: any): Promise<{ handledError?: ManuallyThrownError }> {
    const errorMessage = (error as ExecaError).stderr;
    if (!errorMessage) return {};

    if (/not logged in/i.test(errorMessage)) {
      await this.handlePostLogout();
      return { handledError: new NotLoggedInError("Not logged in") };
    }
    if (/Premium status/i.test(errorMessage)) {
      return { handledError: new PremiumFeatureError() };
    }
    return {};
  }

  setActionListener<A extends keyof BwActionListeners>(action: A, listener: BwActionListeners[A]): this {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      listeners.add(listener);
    } else {
      this.actionListeners.set(action, new Set([listener]));
    }
    return this;
  }

  removeActionListener<A extends keyof BwActionListeners>(action: A, listener: BwActionListeners[A]): this {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      listeners.delete(listener);
    }
    return this;
  }

  private async callActionListeners<A extends keyof BwActionListeners>(
    action: A,
    ...args: Parameters<NonNullable<BwActionListeners[A]>>
  ) {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          await (listener as any)?.(...args);
        } catch (error) {
          captureException(`Error calling bitwarden action listener for ${action}`, error);
        }
      }
    }
  }

  private showToast = async (toastOpts: Toast.Options): Promise<Toast & { restore: () => Promise<void> }> => {
    if (this.toastInstance) {
      const previousStateToastOpts: Toast.Options = {
        message: this.toastInstance.message,
        title: this.toastInstance.title,
        primaryAction: this.toastInstance.primaryAction,
        secondaryAction: this.toastInstance.secondaryAction,
      };

      if (toastOpts.style) this.toastInstance.style = toastOpts.style;
      this.toastInstance.message = toastOpts.message;
      this.toastInstance.title = toastOpts.title;
      this.toastInstance.primaryAction = toastOpts.primaryAction;
      this.toastInstance.secondaryAction = toastOpts.secondaryAction;
      await this.toastInstance.show();

      return Object.assign(this.toastInstance, {
        restore: async () => {
          await this.showToast(previousStateToastOpts);
        },
      });
    } else {
      const toast = await showToast(toastOpts);
      return Object.assign(toast, { restore: () => toast.hide() });
    }
  };
}
