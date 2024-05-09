import { prepareCommandError } from "./bitwarden.helpers";
import { BwCommands } from "./bitwarden.types";

class MockExecaError extends Error {
  shortMessage: string;
  command: string;
  stderr: string;

  constructor(command: string, stderr: string) {
    const shortMessage = `Command failed with exit code 1: ${command}\n${stderr}`;
    super(shortMessage);
    this.name = "MockExecaError";
    this.shortMessage = shortMessage;
    this.command = command;
    this.stderr = stderr;
    this.stack = `${this.name}: ${shortMessage}
    at makeError (/Users/john/.config/raycast/extensions/bitwarden/search.js:13508:13)
    at handlePromise (/Users/john/.config/raycast/extensions/bitwarden/search.js:14407:29)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Bitwarden.exec (/Users/john/.config/raycast/extensions/bitwarden/search.js:16402:20)
    at async Bitwarden.unlock (/Users/john/.config/raycast/extensions/bitwarden/search.js:16468:40)
    at async onSubmit (/Users/john/.config/raycast/extensions/bitwarden/search.js:16938:7)
    at async /Applications/Raycast.app/Contents/Resources/RaycastNodeExtensions_RaycastNodeExtensions.bundle/Contents/Resources/api/node_modules/@raycast/api/index.js:20:5952`;
  }
}

type CommandDefinition = string | ((value: any) => string);

const mockCliPath = "/opt/homebrew/bin/bw";
const mockCommands: Record<keyof BwCommands, CommandDefinition> = {
  login: `${mockCliPath} login --apikey`,
  logout: `${mockCliPath} logout`,
  lock: `${mockCliPath} lock`,
  unlock: (password: string) => `${mockCliPath} unlock ${password} --raw`,
  sync: `${mockCliPath} sync`,
  getItem: (id: string) => `${mockCliPath} get items ${id}`,
  listItems: `${mockCliPath} list items`,
  listFolders: `${mockCliPath} list folders`,
  createFolder: (payload: string) => `${mockCliPath} create folder ${payload}`,
  getTotp: (id: string) => `${mockCliPath} get totp ${id}`,
  status: `${mockCliPath} status`,
  checkLockStatus: `${mockCliPath} unlock --check`,
  getTemplate: `${mockCliPath} get template folder`,
  encode: `${mockCliPath} encode`,
  generatePassword: `${mockCliPath} generate --length 20`,
  listSends: `${mockCliPath} send list`,
  createSend: (payload: string) => `${mockCliPath} send create ${payload}`,
  editSend: (payload: string) => `${mockCliPath} send edit ${payload}`,
  deleteSend: (id: string) => `${mockCliPath} send delete ${id}`,
  removeSendPassword: (id: string) => `${mockCliPath} send remove-password ${id}`,
  receiveSendInfo: (url: string) => `${mockCliPath} send receive ${url}`,
  receiveSend: (url: string) => `${mockCliPath} send receive ${url}`,
};
const mockStderr = `error: unknown option '--foobar'\n(Did you mean --foobaz?)`;

type GetCommandStringReturn = {
  commandString: string;
  redactedCommandString?: string;
  sensitiveValues?: [string];
};

function getCommandString(command: CommandDefinition): GetCommandStringReturn;
function getCommandString(
  command: CommandDefinition,
  forgottenSensitiveValue: string
): Require<GetCommandStringReturn, "sensitiveValues">;
function getCommandString(command: CommandDefinition, forgottenSensitiveValue?: string): GetCommandStringReturn {
  if (typeof command === "function") {
    const sensitiveValues: [string] = ["POSSIBLE_SENSITIVE_VALUE"];
    return {
      commandString: forgottenSensitiveValue ? command(forgottenSensitiveValue) : command(...sensitiveValues),
      redactedCommandString: command("[REDACTED]"),
      sensitiveValues,
    };
  }
  return { commandString: command };
}

describe("bitwarden.helpers", () => {
  describe("prepareCommandError", () => {
    Object.entries(mockCommands).forEach(([commandName, command]) => {
      it(`error thrown by ${commandName} bitwarden command should be free of sensitive values if defined`, () => {
        const { sensitiveValues, commandString, redactedCommandString } = getCommandString(command);
        const error = new MockExecaError(commandString, mockStderr);
        const result = prepareCommandError(commandName, error, sensitiveValues);

        if (sensitiveValues) {
          expect(result.message).not.toEqual(error.message);
          expect(result.stack).not.toEqual(error.stack);

          // no sensitive values
          sensitiveValues.forEach((sensitiveValue) => {
            expect(result.message).not.toContain(sensitiveValue);
            expect(result.stack).not.toContain(sensitiveValue);
          });
          expect(result.message).not.toContain(commandString);
          expect(result.stack).not.toContain(commandString);

          // has redacted strings
          expect(result.stack).toContain("[REDACTED]");
          expect(result.message).toContain("[REDACTED]");
          expect(result.stack).toContain(redactedCommandString);
          expect(result.message).toContain(redactedCommandString);
        } else {
          expect(result.message).toEqual(error.message);
          expect(result.stack).toEqual(error.stack);
        }
      });
    });

    Object.entries(mockCommands).forEach(([commandName, command]) => {
      if (typeof command !== "function") return;

      it(`should omit whole ${commandName} command if sensitive values were defined but the error remained unchanged`, () => {
        const forgottenSensitiveValue = "MYPASSWORD";
        const { sensitiveValues, commandString, redactedCommandString } = getCommandString(
          command,
          forgottenSensitiveValue
        );

        const error = new MockExecaError(commandString, mockStderr);
        const result = prepareCommandError(commandName, error, sensitiveValues);

        expect(commandString).toContain(forgottenSensitiveValue);

        expect(result.message).not.toEqual(error.message);
        expect(result.stack).not.toEqual(error.stack);

        // no command string, redacted or not
        sensitiveValues.forEach((sensitiveValue) => {
          expect(result.stack).not.toContain(sensitiveValue);
        });
        expect(result.message).not.toContain(commandString);
        expect(result.message).not.toContain(redactedCommandString);

        // has redacted command name string
        expect(result.stack).toContain(`[${commandName.toUpperCase()}]`);
      });
    });

    it(`should return regular error when the error thrown by the command was not an ExecaError`, () => {
      const errorMessage = "Some error";
      const error = new Error(errorMessage);
      const commandName = "someCommand";
      const result = prepareCommandError(commandName, error);

      expect(result.message).toContain(`Error executing ${commandName}`);
      expect(result.stack).toContain(`Error: ${errorMessage}`);
    });
  });
});
