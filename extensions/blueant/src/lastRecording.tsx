import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Toast,
  environment,
  getPreferenceValues,
  open,
  showToast,
} from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import puppeteer, { ElementHandle, Frame, Page } from "puppeteer";
import { Cache } from "./helpers/cache";
import { login } from "./commands/login";
import { clearInput } from "./commands/clearInput";
import { leadingZero } from "./helpers/dates";

const { domain } = getPreferenceValues<Preferences>();

const Pages = {
  TimeRecording: `https://${domain}/psap?p=TimeRecording&t=0`,
} as const;

type PageUrl = (typeof Pages)[keyof typeof Pages];

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const getRecordingDate = (date: Date) => {
  return [leadingZero(date.getDate()), leadingZero(date.getMonth() + 1), date.getFullYear()].join(".");
};

const getDateString = (date: Date) => {
  return [date.getFullYear(), leadingZero(date.getMonth() + 1), leadingZero(date.getDate())].join("-");
};

const cachePreviousComment = (message: string) => {
  Cache.set("previousComment", getDateString(new Date()) + message);
};

const getCachedPreviousComment = () => {
  const cachedValue = Cache.get("previousComment");
  if (!cachedValue) return null;

  const date = new Date(cachedValue.substring(0, 10));
  if (!isToday(date)) return null;
  return cachedValue.substring(10);
};

const selectOptionByLabel = async (page: Page, content: Frame, label: string, value: string) => {
  const selectContainer = await content.waitForSelector(
    `xpath///label[text()="${label}"]/../..//*[contains(@class, "bang-listbox-widget")]`,
  );
  const widgetId = await (await selectContainer?.getProperty("id"))?.jsonValue();
  if (!selectContainer || !widgetId) throw new Error(`${label} widget identifier not found`);

  await selectContainer?.click({ delay: 100 });
  await page.keyboard.type(value, { delay: 10 });
  await content.click(`[data-id="${widgetId}"]>ul>li:not(.filtered)`);
  return page.keyboard.press("Enter", { delay: 200 }); // make sure the select is closed
};

const openBrowserAtPage = async (url: PageUrl, toast?: Toast) => {
  !!toast && (toast.message = "Opening page");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 800 });

  return { browser, page };
};

const waitForTimeRecordingContent = async (page: Page) => {
  const iframe = await page.waitForSelector("#rootcontent > iframe");
  const content = await iframe?.contentFrame();
  if (!content) throw new Error("Frame not found");
  return content;
};


const setDate = async (page: Page, content: Frame) => {
  const dateInput = await content.waitForSelector('[name="datum"]', { timeout: 10000 });
  if (!dateInput) throw new Error("Could not find date input field");

  await clearInput(page, dateInput, 10);
  const previousDay = new Date();
  previousDay.setDate(previousDay.getDate() - 1);
  await dateInput.type(getRecordingDate(previousDay), { delay: 10 });

  await page.keyboard.press("Tab", { delay: 1000 }); // exit the date input
};

const getPreviousDayComment = async (toast?: Toast) => {
  const { browser, page } = await openBrowserAtPage(Pages.TimeRecording, toast);
  try {
    await login(page, toast);
    const content = await waitForTimeRecordingContent(page);

    const dateInput = await content.waitForSelector('[name="datum"]', { timeout: 10000 });
    if (!dateInput) throw new Error("Could not find date input field");

    !!toast && (toast.message = "Getting yesterday's message");

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

export default function TimeRecordingCommand() {
  const { itemProps, handleSubmit, setValue } = useForm<FormValues>({
    onSubmit: async (values) => {
      cacheValues(values);
      return onSubmit(values as SubmittedFormValues);
    },
    initialValues: getInitialValues(),
    validation: {
      date: FormValidation.Required,
      duration: FormValidation.Required,
      client: FormValidation.Required,
      project: FormValidation.Required,
      activity: FormValidation.Required,
      location: FormValidation.Required,
      comment: FormValidation.Required,
    },
  });

  const getPrefillCommentHandler =
    (shouldForce = false) =>
    async () => {
      const cachedPreviousComment = getCachedPreviousComment();
      if (cachedPreviousComment && !shouldForce) {
        setValue("comment", cachedPreviousComment);
      } else {
        const toast = await showToast({ style: Toast.Style.Animated, title: "Pre-filling comment..." });
        try {
          const previousDayComment = await getPreviousDayComment(toast);
          setValue("comment", previousDayComment);
          await toast.hide();
        } catch (error) {
          environment.isDevelopment && console.error(error);
          toast.title = "Failed to pre-fill comment";
          toast.style = Toast.Style.Failure;
        }
      }
    };

  async function onSubmit(values: SubmittedFormValues) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Recording time...", message: "Please wait" });
    try {
      if (!values.date) throw new Error("Date is required");

      await recordTime(values, toast);
      toast.title = "Time recorded";
      toast.style = Toast.Style.Success;
      toast.message = "Time recording submitted successfully";
    } catch (error) {
      environment.isDevelopment && console.error(error);
      toast.title = "Failed to record time";
      toast.style = Toast.Style.Failure;
      toast.message = error instanceof Error ? error.message : "An error occurred";
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Time Recording" onSubmit={handleSubmit} icon={Icon.SaveDocument} />
          <Action title="Prefill Last Day's Comment" onAction={getPrefillCommentHandler()} icon={Icon.TextCursor} />
          <Action
            title="Prefill Last Day's Comment (Force)"
            onAction={getPrefillCommentHandler(true)}
            icon={Icon.TextCursor}
          />
        </ActionPanel>
      }
    >
      <Form.DatePicker {...itemProps.date} title="Date" />
      <Form.TextField {...itemProps.duration} title="Duration" storeValue />
      <Form.TextField {...itemProps.client} title="Client" storeValue />
      <Form.TextField {...itemProps.project} title="Project" storeValue />
      <Form.TextField {...itemProps.activity} title="Activity" storeValue />
      <Form.Dropdown {...itemProps.location} title="Location" storeValue>
        {locationOptions.map((option) => (
          <Form.Dropdown.Item key={option} value={option} title={option} />
        ))}
      </Form.Dropdown>
      <Form.TextArea {...itemProps.comment} title="Comment" />
    </Form>
  );
}
