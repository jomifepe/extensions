import {
  Toast,
  environment,
  open,
} from "@raycast/api";
import { login } from "~/helpers/commands/login";
import { openBrowserAtPage } from "~/helpers/commands/openBrowserAtPage";
import { Pages } from "~/constants/pages";
import { delay } from "~/helpers/puppeteer";
import { cachePreviousComment } from "~/helpers/cache";
import { waitForTimeRecordingContent } from "~/helpers/commands/timeRecording/waitForTimeRecordingContent";


export const getLastRecordingComment = async (toast?: Toast) => {
  const { browser, page } = await openBrowserAtPage(Pages.TimeRecording, toast);
  try {
    await login(page, toast);
    const content = await waitForTimeRecordingContent(page);

    const dateInput = await content.waitForSelector('[name="datum"]', { timeout: 10000 });
    if (!dateInput) throw new Error("Could not find date input field");

    !!toast && (toast.message = "Getting comment");
    await content.evaluate(() => {
      const elements = Array.from(document.querySelectorAll(".cm_worktime_recorded > .cm_link"));
      return (elements[elements.length - 1] as HTMLAnchorElement).click();
    });

    const duplicatePreviousDayButton = await content.waitForSelector(
      '.caption_worktime .table .tbody > .tr:last-child a[title="Copy work-time"]',
      { timeout: 10000 },
    );
    await delay(500); // for some reason the button appears but isn't clickable yet
    if (!duplicatePreviousDayButton) throw new Error("Could not find duplicate previous day button");

    await duplicatePreviousDayButton.click({ delay: 100 }); // select the previous day
    await delay(2000);

    const previousMessage = await content.evaluate(() => {
      const copyText = document.querySelector('[name="bemerkung1000"]') as HTMLInputElement;
      return copyText.value;
    });

    if (cachePreviousComment) cachePreviousComment(previousMessage);

    return previousMessage;
  } catch (error) {
    environment.isDevelopment && console.error(error);
    const screenshotPath = `${environment.supportPath}/time-recording-get-previous-day-comment-error.png`;
    const screenshot = await page?.screenshot({ path: screenshotPath });
    if (screenshot) open(screenshotPath);

    throw new Error("Failed to get previous day's comment");
  } finally {
    !!toast && (toast.message = "Finishing...");
    await browser?.close();
  }
};
