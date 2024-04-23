import { environment } from "@raycast/api";
import { Page } from "puppeteer";
import { takeAndOpenScreenshot } from "~/helpers/puppeteer";

type Result = { screenshotPath?: string };

export function handleCommandError(error: any): void;
export async function handleCommandError(error: any, page: Page, screenshotName: string): Promise<Result>;
export async function handleCommandError(error: any, page?: Page, screenshotName?: string): Promise<Result> {
  environment.isDevelopment && console.error(...(Array.isArray(error) ? error : [error]));
  if (page && screenshotName) {
    const screenshotPath = await takeAndOpenScreenshot(page, screenshotName);
    return { screenshotPath };
  };
  return {};
}