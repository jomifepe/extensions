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

const getCommandString = (command: string | ((value: any) => string)) => {
  if (typeof command === "function") {
    const sensitiveValue = "POSSIBLE_SENSITIVE_VALUE";
    return { commandString: command(sensitiveValue), sensitiveValue };
  }
  return { commandString: command };
};

describe("bitwarden.helpers", () => {
  describe("prepareCommandError", () => {
    Object.entries(mockCommands).forEach(([commandName, command]) => {
      it(`ExecaError thrown by ${commandName} bitwarden command should not contain executed CLI command`, () => {
        const { commandString, sensitiveValue } = getCommandString(command);
        const error = new MockExecaError(commandString, `error: unknown option '--foobar'\n(Did you mean --foobaz?)`);
        const result = prepareCommandError(commandName, error);

        if (sensitiveValue) {
          expect(result.message).not.toContain(sensitiveValue);
          expect(result.stack).not.toContain(sensitiveValue);
        }
        const redactedValue = `${mockCliPath} ${commandName}`;
        expect(result.message).not.toContain(error.command);
        expect(result.stack).not.toContain(error.command);
        expect(result.stack).toContain(redactedValue);
        expect(result.stack).toContain(error.stderr);
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
