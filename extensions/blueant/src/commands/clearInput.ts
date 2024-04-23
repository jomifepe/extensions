import { ElementHandle, Page } from "puppeteer";

export const clearInput = async (page: Page, element: ElementHandle, amount: number) => {
  await element.focus();
  for (let i = 0; i < amount; i++) {
    await page.keyboard.press("Delete");
  }
};