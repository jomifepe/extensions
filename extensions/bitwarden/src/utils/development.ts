/* eslint-disable @typescript-eslint/no-explicit-any */
import { environment, LocalStorage } from "@raycast/api";
import { execa } from "execa";
import { LOCAL_STORAGE_KEY } from "~/constants/general";

export async function captureException(...error: any[]) {
  if (environment.isDevelopment) {
    console.error(...error);
  } else {
    let debugLog = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY.DEBUG_LOG);
    const errorString = `[${new Date().toISOString()}] ${error.join("\n")}`;
    if (!debugLog) {
      const bwVersion = await getBwVersion();
      debugLog = `Raycast version: ${environment.raycastVersion}
Bitwarden CLI version: ${bwVersion}

${errorString}`;
    } else {
      debugLog += `\n${errorString}`;
    }
    await LocalStorage.setItem(LOCAL_STORAGE_KEY.DEBUG_LOG, debugLog);
  }
}

export async function getBwVersion() {
  try {
    const { stdout: bwVersion } = await execa("bw", ["--version"]);
    return bwVersion;
  } catch (error) {
    return "unknown";
  }
}
