import { Toast } from "@raycast/api";
import puppeteer from "puppeteer";

export const openBrowserAtPage = async (url: PageUrl, toast?: Toast) => {
  !!toast && (toast.message = "Opening page");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 800 });

  return { browser, page };
};