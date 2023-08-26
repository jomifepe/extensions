import { LocalStorage, Toast, environment, showToast } from "@raycast/api";
import { ExecaError, execa } from "execa";
import { chmodSync } from "fs";
import { join } from "path";
import { captureException } from "~/utils/development";

enum FingerprintError {
  Canceled = 254,
}

const NATIVE_UTILS_BIN = join(environment.assetsPath, "Bitwarden");

async function enableFingerprintCommand() {
  const toast = await showToast(Toast.Style.Animated, "Getting fingerprint");
  const fingerprintDataHash = await promptForFingerprint();
  if (fingerprintDataHash) {
    await LocalStorage.setItem("fingerprintData", fingerprintDataHash);
  }
  await toast.hide();
}

async function promptForFingerprint() {
  const path = join(environment.assetsPath, "Bitwarden");
  chmodSync(NATIVE_UTILS_BIN, "755");
  try {
    const { stdout } = await execa(path, ["biometric"]);
    return stdout;
  } catch (error) {
    const execaError = error as ExecaError;
    if (execaError.exitCode === FingerprintError.Canceled) return;
    await showToast(Toast.Style.Failure, "Failed to enable fingerprint");
    captureException("Failed to get fingerprint data", error);
  }
}

export default enableFingerprintCommand;
