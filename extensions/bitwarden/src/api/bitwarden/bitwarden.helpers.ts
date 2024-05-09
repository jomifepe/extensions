import { environment } from "@raycast/api";
import { ExecaError } from "execa";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import type { SendCreatePayload } from "~/types/send";
import { BitwardenCommandError, tryExec } from "~/utils/errors";
import { ensureArray } from "~/utils/objects";
import { toScreamingCase } from "~/utils/strings";

const { supportPath } = environment;

const Δ = "3"; // changing this forces a new bin download for people that had a failed one
export const BinDownloadLogger = (() => {
  /* The idea of this logger is to write a log file when the bin download fails, so that we can let the extension crash,
   but fallback to the local cli path in the next launch. This allows the error to be reported in the issues dashboard. It uses files to keep it synchronous, as it's needed in the constructor.
   Although, the plan is to discontinue this method, if there's a better way of logging errors in the issues dashboard
   or there are no crashes reported with the bin download after some time. */
  const filePath = join(supportPath, `bw-bin-download-error-${Δ}.log`);
  return {
    logError: (error: any) => tryExec(() => writeFileSync(filePath, error?.message ?? "Unexpected error")),
    clearError: () => tryExec(() => unlinkSync(filePath)),
    hasError: () => tryExec(() => existsSync(filePath), false),
  };
})();

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
  if (!sensitiveValues) return value;

  const cleanValue = ensureArray(sensitiveValues).reduce<string>((result, sensitiveValue) => {
    return sensitiveValue ? result.replace(new RegExp(sensitiveValue, "gi"), "[REDACTED]") : result;
  }, value);

  if (cleanValue === value) {
    const cliPath = command.replace(/^(\/[^ ]*).*/, "$1");
    return value.replace(
      new RegExp(command, "gi"),
      cliPath ? `${cliPath} [${toScreamingCase(commandName)}]` : commandName
    );
  }

  return cleanValue;
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
