import { ExecaError } from "execa";
import { SendCreatePayload } from "~/types/send";
import { BitwardenCommandError } from "~/utils/errors";
import { ensureArray } from "~/utils/objects";

export function prepareSendPayload(template: SendCreatePayload, values: SendCreatePayload): SendCreatePayload {
  return {
    ...template,
    ...values,
    file: values.file ? { ...template.file, ...values.file } : template.file,
    text: values.text ? { ...template.text, ...values.text } : template.text,
  };
}

const redactSensitiveValues = (
  value: string,
  command: string,
  commandName: string,
  sensitiveValues?: Nullable<string> | Nullable<string>[]
): string => {
  if (sensitiveValues) {
    const cleanValue = ensureArray(sensitiveValues).reduce<string>((result, sensitiveValue) => {
      return sensitiveValue ? result.replace(new RegExp(sensitiveValue, "gi"), "[REDACTED]") : result;
    }, value);
    if (cleanValue === value) {
      const cliPath = command.replace(/^(\/[^ ]*).*/, "$1");
      return value.replace(
        new RegExp(command, "gi"),
        cliPath ? `${cliPath} [${commandName.toUpperCase()}]` : commandName
      );
    }
    return cleanValue;
  }
  return value;
};

export function prepareCommandError(
  commandName: string,
  error: any,
  sensitiveValues?: Nullable<string> | Nullable<string>[]
) {
  const execaError = error as ExecaError;
  if (execaError.stderr) {
    const { shortMessage, stack, command } = execaError;
    return new BitwardenCommandError(
      redactSensitiveValues(shortMessage, command, commandName, sensitiveValues),
      stack && redactSensitiveValues(stack, command, commandName, sensitiveValues)
    );
  } else {
    return new BitwardenCommandError(`Error executing ${commandName}`, (error as Error).stack);
  }
}
