import { Page } from "puppeteer";

export const waitForTimeRecordingContent = async (page: Page) => {
  const iframe = await page.waitForSelector("#rootcontent > iframe");
  const content = await iframe?.contentFrame();
  if (!content) throw new Error("Frame not found");
  return content;
};