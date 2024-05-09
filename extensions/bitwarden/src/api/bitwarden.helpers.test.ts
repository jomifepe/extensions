import { prepareCommandError } from "~/api/bitwarden.helpers";

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

const mockCliPath = "/opt/homebrew/bin/bw";
const mockCommands = {
  login: `${mockCliPath} login --apikey --foobar`,
  logout: `${mockCliPath} logout --foobar`,
  lock: `${mockCliPath} lock --foobar`,
  unlock: (password: string) => `${mockCliPath} unlock ${password} --raw --foobar`,
  sync: `${mockCliPath} sync --foobar`,
  listItems: `${mockCliPath} list items --foobar`,
  listFolders: `${mockCliPath} list folders --foobar`,
  createFolder: (payload: string) => `${mockCliPath} create folder ${payload} --foobar`,
  getTotp: (id: string) => `${mockCliPath} get totp ${id} --foobar`,
  status: `${mockCliPath} status --foobar`,
  getTemplate: `${mockCliPath} get template folder --foobar`,
  encode: `${mockCliPath} encode --foobar`,
  generatePassword: `${mockCliPath} generate --length 20 --foobar`,
  listSends: `${mockCliPath} send list --foobar`,
  createSend: (payload: string) => `${mockCliPath} send create ${payload} --foobar`,
  editSend: (payload: string) => `${mockCliPath} send edit ${payload} --foobar`,
  deleteSend: (id: string) => `${mockCliPath} send delete ${id} --foobar`,
  removeSendPassword: (id: string) => `${mockCliPath} send remove-password ${id} --foobar`,
  receiveSendInfo: (url: string) => `${mockCliPath} send receive ${url} --foobar`,
  receiveSend: (url: string) => `${mockCliPath} send receive ${url} --foobar`,
};

const getCommandString = (command: string | ((value: any) => string), badSensitiveValue?: string) => {
  if (typeof command === "function") {
    const sensitiveValues = ["POSSIBLE_SENSITIVE_VALUE"] as [string];
    return {
      commandString: badSensitiveValue ? command(badSensitiveValue) : command(...sensitiveValues),
      redactedCommandString: command("[REDACTED]"),
      sensitiveValues,
    };
  }
  return { commandString: command };
};

describe("bitwarden.helpers", () => {
  describe("prepareCommandError", () => {
    Object.entries(mockCommands).forEach(([commandName, command]) => {
      it(`error thrown by ${commandName} bitwarden command should be free of sensitive values if defined`, () => {
        const { sensitiveValues, commandString, redactedCommandString } = getCommandString(command);
        const error = new MockExecaError(commandString, `error: unknown option '--foobar'\n(Did you mean --foobaz?)`);
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

      it(`should omit whole ${commandName} command if sensitiveValues were defined but the error remained unchanged`, () => {
        const badSensitiveValue = "MYPASSWORD";
        const { sensitiveValues, commandString, redactedCommandString } = getCommandString(command, badSensitiveValue);

        const error = new MockExecaError(commandString, `error: unknown option '--foobar'\n(Did you mean --foobaz?)`);
        const result = prepareCommandError(commandName, error, sensitiveValues);

        expect(commandString).toContain(badSensitiveValue);

        expect(result.message).not.toEqual(error.message);
        expect(result.stack).not.toEqual(error.stack);

        // no command string, redacted or not
        sensitiveValues!.forEach((sensitiveValue) => {
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
