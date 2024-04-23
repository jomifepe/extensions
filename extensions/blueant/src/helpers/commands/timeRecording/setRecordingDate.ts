import { Frame, Page } from "puppeteer";
import { clearInput } from "../clearInput";
import { leadingZero } from "../../dates";

const getRecordingDate = (date: Date) => {
  return [leadingZero(date.getDate()), leadingZero(date.getMonth() + 1), date.getFullYear()].join(".");
};

export const setRecordingDate = async (page: Page, content: Frame) => {
  const dateInput = await content.waitForSelector('[name="datum"]', { timeout: 10000 });
  if (!dateInput) throw new Error("Could not find date input field");

  await clearInput(page, dateInput, 10);
  const previousDay = new Date();
  previousDay.setDate(previousDay.getDate() - 1);
  await dateInput.type(getRecordingDate(previousDay), { delay: 10 });

  await page.keyboard.press("Tab", { delay: 1000 }); // exit the date input
};