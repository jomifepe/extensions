import { environment } from "@raycast/api";
import { Page } from "puppeteer";
import { takeAndOpenScreenshot } from "~/helpers/puppeteer";

export function handleCommandError(error: any): void;
export async function handleCommandError(error: any, page: Page, screenshotName: string): Promise<void>;
export async function handleCommandError(error: any, page?: Page, screenshotName?: string): Promise<void> {
  environment.isDevelopment && console.error(...(Array.isArray(error) ? error : [error]));
  if (page && screenshotName) await takeAndOpenScreenshot(page, screenshotName);
}