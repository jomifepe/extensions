import { environment, open } from "@raycast/api";
import { Page } from "puppeteer";

export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export const takeAndOpenScreenshot = async (page: Page, name: string) => {
  const screenshotPath = `${environment.supportPath}/${name}.png`;
  const screenshot = await page?.screenshot({ path: screenshotPath });
  if (screenshot) open(screenshotPath);
}