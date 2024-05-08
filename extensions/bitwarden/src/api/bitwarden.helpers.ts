import { ExecaError } from "execa";
import { SendCreatePayload } from "~/types/send";
import { BitwardenCommandError } from "~/utils/errors";

export function prepareSendPayload(template: SendCreatePayload, values: SendCreatePayload): SendCreatePayload {
  return {
    ...template,
    ...values,
    file: values.file ? { ...template.file, ...values.file } : template.file,
    text: values.text ? { ...template.text, ...values.text } : template.text,
  };
}

const extractCliPath = (command: string): string => {
  return command.replace(/^(\/[^ ]*).*/, "$1");
};

const replaceCliCommand = (message: string, command: string, commandName: string): string => {
  const redactedValue = `${extractCliPath(command)} ${commandName}`;
  return message ? message.replace(new RegExp(command, "gi"), redactedValue) : redactedValue;
};

export function prepareCommandError(commandName: string, error: any) {
  const execaError = error as ExecaError;
  if (execaError.stderr) {
    const safeError = new BitwardenCommandError(
      replaceCliCommand(execaError.shortMessage, execaError.command, commandName),
      execaError.stack ? replaceCliCommand(execaError.stack, execaError.command, commandName) : undefined
    );
    return safeError;
  } else {
    return new BitwardenCommandError(`Error executing ${commandName}`, (error as Error).stack);
  }
}
