import { environment, open } from "@raycast/api";
import { Page } from "puppeteer";

export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export const takeScreenshot = async (page: Page, name: string) => {
  const screenshotPath = `${environment.supportPath}/${name}.png`;
  await page.screenshot({ path: screenshotPath });
  return screenshotPath;
}

export const takeAndOpenScreenshot = async (page: Page, name: string) => {
  const screenshotPath = await takeScreenshot(page, name);
  if (screenshotPath) await open(screenshotPath);
  return screenshotPath;
}