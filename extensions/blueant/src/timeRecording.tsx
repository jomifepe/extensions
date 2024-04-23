import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Toast,
  environment,
  open,
  showToast,
} from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { Frame, Page } from "puppeteer";
import { Cache, getCachedPreviousComment } from "./helpers/cache";
import { login } from "./helpers/commands/login";
import { openBrowserAtPage } from "./helpers/commands/openBrowserAtPage";
import { clearInput } from "./helpers/commands/clearInput";
import { leadingZero } from "./helpers/dates";
import { getLastRecordingComment } from "~/helpers/commands/timeRecording/getLastRecordingComment";
import { Pages } from "~/constants/pages";
import { waitForTimeRecordingContent } from "~/helpers/commands/timeRecording/waitForTimeRecordingContent";

const locationOptions = [
  "on site",
  "Office Cologne",
  "Office Stuttgart",
  "Office Munich",
  "Office Berlin",
  "Office Lisbon",
  "Office Leiria",
  "Office Zurich",
  "Home Office",
  "Office Viseu",
  "Office Frankfurt",
] as const;

type FormValues = {
  date: Date | null;
  duration: string;
  client: string;
  project: string;
  activity: string;
  location: string;
  comment: string;
};

type SubmittedFormValues = {
  [K in keyof FormValues]: NonNullable<FormValues[K]>;
};

const initialValues: FormValues = {
  // Date with 1 millisecond means 'Today' in raycast DatePicker
  date: new Date(new Date().setHours(0, 0, 0, 1)),
  duration: "08:00",
  client: "",
  project: "",
  activity: "",
  location: "",
  comment: "",
};

const getRecordingDate = (date: Date) => {
  return [leadingZero(date.getDate()), leadingZero(date.getMonth() + 1), date.getFullYear()].join(".");
};

const getInitialValues = (): FormValues => {
  const cachedValuesString = Cache.get("timeRecordingFormValues");
  try {
    const cachedValues = cachedValuesString ? JSON.parse(cachedValuesString) : {};
    return { ...initialValues, ...cachedValues };
  } catch {
    return initialValues;
  }
};

const cacheValues = (values: FormValues) => {
  const { comment: _1, date: _2, ...cacheableValues } = values;
  Cache.set("timeRecordingFormValues", JSON.stringify(cacheableValues));
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


const recordTime = async (values: SubmittedFormValues, toast?: Toast) => {
  const { browser, page } = await openBrowserAtPage(Pages.TimeRecording, toast);
  try {
    await login(page, toast);
    const content = await waitForTimeRecordingContent(page);

    !!toast && (toast.message = "Setting date");
    const dateInput = await content.waitForSelector('[name="datum"]', { timeout: 10000 });
    if (!dateInput) throw new Error("Could not find date input field");

    await clearInput(page, dateInput, 10);
    await dateInput.type(getRecordingDate(values.date), { delay: 10 });

    !!toast && (toast.message = "Setting duration");
    await content.type('[name="dauer"]', values.duration, { delay: 10 });

    !!toast && (toast.message = "Setting client");
    await selectOptionByLabel(page, content, "Client", values.client);

    !!toast && (toast.message = "Setting project");
    await selectOptionByLabel(page, content, "Project", values.project);

    !!toast && (toast.message = "Setting activity");
    await selectOptionByLabel(page, content, "Activity", values.activity);

    !!toast && (toast.message = "Setting location");
    await selectOptionByLabel(page, content, "Location", values.location);

    !!toast && (toast.message = "Setting comment");
    await content.type('[name="bemerkung1000"]', values.comment, { delay: 10 });

    !!toast && (toast.message = "Saving");
    await content.click('[name="speichern"]', { delay: 10 });
  } catch (error) {
    if (toast) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to record time";
      toast.message = "Taking screenshot";
    }
    environment.isDevelopment && console.error(error);
    const screenshotPath = `${environment.supportPath}/time-recording-error.png`;
    const screenshot = await page?.screenshot({ path: screenshotPath });
    if (screenshot) open(screenshotPath);

    throw new Error("Failed to record time");
  } finally {
    !!toast && (toast.message = "Finishing");
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
          const previousDayComment = await getLastRecordingComment(toast);
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
