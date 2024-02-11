import { existsSync, mkdirSync, statSync } from "fs";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import streamZip from "node-stream-zip";

export function waitForFileAvailable(path: string): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      try {
        const stats = statSync(path);
        if (stats.isFile()) {
          clearInterval(interval);
          resolve();
        }
      } catch (e) {
        // ignore
      }
    }, 300);
  });
}

export async function decompressFile(filePath: string, targetPath: string) {
  const zip = new streamZip.async({ file: filePath });
  if (!existsSync(targetPath)) mkdirSync(targetPath, { recursive: true });
  await zip.extract(null, targetPath);
  await zip.close();
}

export async function removeFilesThatStartWith(startingWith: string, path: string) {
  let removedAtLeastOne = false;
  try {
    const files = await readdir(path);
    for await (const file of files) {
      if (!file.startsWith(startingWith)) continue;
      try {
        await unlink(join(path, file));
        removedAtLeastOne = true;
      } catch {
        // ignore
      }
    }
  } catch {
    return false;
  }
  return removedAtLeastOne;
}
