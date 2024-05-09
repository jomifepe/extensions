import type { VaultState, VaultStatus } from "~/types/general";
import type { PasswordGeneratorOptions } from "~/types/passwords";
import type { ReceivedSend, Send, SendCreatePayload } from "~/types/send";
import type { Folder, Item } from "~/types/vault";
import type { ManuallyThrownError } from "~/utils/errors";

export type BwEnv = {
  BITWARDENCLI_APPDATA_DIR: string;
  BW_CLIENTSECRET: string;
  BW_CLIENTID: string;
  PATH: string;
  NODE_EXTRA_CA_CERTS?: string;
  BW_SESSION?: string;
};

export type BwExecProps = {
  /** Reset the time of the last command that accessed data or modified the vault, used to determine if the vault timed out */
  resetVaultTimeout: boolean;
  abortController?: AbortController;
  input?: string;
};

export type BwLockOptions = {
  /** The reason for locking the vault */
  reason?: string;
  checkVaultStatus?: boolean;
  /** The callbacks are called before the operation is finished (optimistic) */
  immediate?: boolean;
};

export type BwLogoutOptions = {
  /** The reason for locking the vault */
  reason?: string;
  /** The callbacks are called before the operation is finished (optimistic) */
  immediate?: boolean;
};

export type BwReceiveSendOptions = {
  savePath?: string;
  password?: string;
};

export type BwCommands = {
  checkServerUrl: (url: string) => Promise<MaybeError>;
  login: () => Promise<MaybeError>;
  logout: (options?: BwLogoutOptions) => Promise<MaybeError>;
  lock: (options?: BwLockOptions) => Promise<MaybeError>;
  unlock: (password: string) => Promise<MaybeError<string>>;
  sync: () => Promise<MaybeError>;
  getItem: (id: string) => Promise<MaybeError<Item>>;
  listItems: () => Promise<MaybeError<Item[]>>;
  listFolders: () => Promise<MaybeError<Folder[]>>;
  createFolder: (name: string) => Promise<MaybeError>;
  getTotp: (id: string) => Promise<MaybeError<string>>;
  status: () => Promise<MaybeError<VaultState>>;
  checkLockStatus: () => Promise<VaultStatus>;
  getTemplate: <T = any>(type: string) => Promise<MaybeError<T>>;
  encode: (input: string) => Promise<MaybeError<string>>;
  generatePassword: (
    options?: PasswordGeneratorOptions,
    abortController?: AbortController
  ) => Promise<MaybeError<string>>;
  listSends: () => Promise<MaybeError<Send[]>>;
  createSend: (values: SendCreatePayload) => Promise<MaybeError<Send>>;
  editSend: (values: SendCreatePayload) => Promise<MaybeError<Send>>;
  deleteSend: (id: string) => Promise<MaybeError>;
  removeSendPassword: (id: string) => Promise<MaybeError>;
  receiveSendInfo: (url: string, options?: BwReceiveSendOptions) => Promise<MaybeError<ReceivedSend>>;
  receiveSend: (url: string, options?: BwReceiveSendOptions) => Promise<MaybeError<string>>;
};

export type BwActionListeners = {
  login?: () => MaybePromise<void>;
  logout?: (reason?: string) => MaybePromise<void>;
  lock?: (reason?: string) => MaybePromise<void>;
  unlock?: (password: string, sessionToken: string) => MaybePromise<void>;
};

export type BwActionListenersMap<T extends keyof BwActionListeners = keyof BwActionListeners> = Map<
  T,
  Set<BwActionListeners[T]>
>;

export type MaybeError<T = undefined> =
  | { result: T; error?: undefined }
  | { result?: undefined; error: ManuallyThrownError };
