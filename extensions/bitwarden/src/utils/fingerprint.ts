import { Toast, environment, showToast } from "@raycast/api";
import { ExecaError, execa } from "execa";
import { chmod } from "fs/promises";
import { join } from "path";
import { captureException } from "~/utils/development";

enum FingerprintError {
  Canceled = 254,
}

const NATIVE_UTILS_BIN = join(environment.assetsPath, "Bitwarden");

export async function promptForFingerprint() {
  try {
    await chmod(NATIVE_UTILS_BIN, "755");
    const { stdout } = await execa(NATIVE_UTILS_BIN, ["biometric"]);
    return stdout;
  } catch (error) {
    const execaError = error as ExecaError;
    if (execaError.exitCode === FingerprintError.Canceled) return;
    await showToast(Toast.Style.Failure, "Failed to enable fingerprint");
    captureException("Failed to get fingerprint data", error);
  }
}
