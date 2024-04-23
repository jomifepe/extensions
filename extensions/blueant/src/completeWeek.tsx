import { confirmAlert, open, showToast, Toast } from "@raycast/api";
import { Pages } from "~/constants/pages";
import { login } from "~/helpers/commands/login";
import { openBrowserAtPage } from "~/helpers/commands/openBrowserAtPage";
import { handleCommandError } from "~/helpers/errors";
import { takeScreenshot } from "~/helpers/puppeteer";

export default async function CompleteWeekCommand() {
  const hasConfirmed = await confirmAlert({
    title: "Complete week",
    message: "Are you sure you want to complete the week?",
  });

  if (hasConfirmed) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Completing week" });
    const { browser, page } = await openBrowserAtPage(Pages.TimeRecording, toast);
    try {
      await login(page, toast);

      !!toast && (toast.message = "Completing week");
      const toolbar = await page.waitForSelector(".dynamicToolbarParent0", { timeout: 10000 });
      if (!toolbar) throw new Error("Could not find toolbar");

      await toolbar.click({ delay: 100 });
      const completeButton = await page.waitForSelector('[title="Report calendar week complete"]', { timeout: 10000 });
      if (!completeButton) throw new Error("Could not find complete week button");

      await completeButton.click({ delay: 100 });

      const confirmButton = await page.waitForSelector(".confirmtext .bang-button-widget:not(.secondary)", {
        timeout: 10000,
      });
      if (!confirmButton) throw new Error("Could not find complete week confirm button");

      await confirmButton.click({ delay: 100 });

      const completeToday = await page.waitForSelector(".cm_today.cm_calendar_week", { timeout: 10000 });

      const successScreenshot = completeToday && (await takeScreenshot(page, "complete-week-success"));

      toast.title = "Week completed";
      toast.style = Toast.Style.Success;
      if (successScreenshot) {
        toast.primaryAction = {
          title: "Open screenshot",
          onAction: () => open(successScreenshot),
        };
      }
    } catch (error) {
      const { screenshotPath } = await handleCommandError(error, page, "complete-week-error");
      if (toast) {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed to complete week";
        if (screenshotPath) {
          toast.primaryAction = {
            title: "Open screenshot",
            onAction: () => open(screenshotPath),
          };
        }
      }
      throw new Error("Failed to complete week");
    } finally {
      await browser?.close();
    }
  }
}
