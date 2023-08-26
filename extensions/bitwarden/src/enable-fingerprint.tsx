import {
  Alert,
  Icon,
  LocalStorage,
  Toast,
  confirmAlert,
  environment,
  showHUD,
  showToast,
  updateCommandMetadata,
} from "@raycast/api";
import { ExecaError, execa } from "execa";
import { chmod } from "fs/promises";
import { join } from "path";
import { LOCAL_STORAGE_KEY } from "~/constants/general";
import { captureException } from "~/utils/development";

enum FingerprintError {
  Canceled = 254,
}

const NATIVE_UTILS_BIN = join(environment.assetsPath, "Bitwarden");

async function enableFingerprintCommand() {
  if (await LocalStorage.getItem(LOCAL_STORAGE_KEY.FINGERPRINT_HASH)) {
    const confirmedDisable = await confirmAlert({
      icon: Icon.Fingerprint,
      title: "Fingerprint already enabled",
      message: "Fingerprint authentication is already enabled. Do you want to disable it?",
      primaryAction: { title: "Disable", style: Alert.ActionStyle.Destructive },
    });
    if (confirmedDisable) {
      await LocalStorage.removeItem(LOCAL_STORAGE_KEY.FINGERPRINT_HASH);
      await showToast(Toast.Style.Success, "Fingerprint disabled");
      await updateCommandMetadata({ subtitle: undefined });
    }
    return;
  }

  const toast = await showToast(Toast.Style.Animated, "Getting fingerprint");
  const fingerprintHash = await promptForFingerprint();

  if (fingerprintHash) {
    await LocalStorage.setItem(LOCAL_STORAGE_KEY.FINGERPRINT_HASH, fingerprintHash);
    await updateCommandMetadata({ subtitle: "✅" });
    await showHUD("Fingerprint enabled ✅");
  } else {
    await toast.hide();
  }
}

async function promptForFingerprint() {
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
export default enableFingerprintCommand;
