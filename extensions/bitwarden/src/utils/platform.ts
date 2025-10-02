export function getPlatform() {
  return process.platform === "darwin" ? "macos" : "windows";
}
