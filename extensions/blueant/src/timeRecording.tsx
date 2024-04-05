import {
  Action,
  ActionPanel,
  Cache,
  Form,
  Toast,
  environment,
  getPreferenceValues,
  open,
  showToast,
} from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import puppeteer, { Browser, ElementHandle, Frame, Page } from "puppeteer";

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

const cache = new Cache({ namespace: environment.commandName });

const getInitialValues = (): FormValues => {
  const cachedValuesString = cache.get("timeRecordingFormValues");
  try {
    console.log({ cachedValuesString });
    const cachedValues = cachedValuesString ? JSON.parse(cachedValuesString) : {};
    return { ...initialValues, ...cachedValues };
  } catch {
    return initialValues;
  }
};

const cacheValues = (values: FormValues) => {
  const { comment: _1, date: _2, ...cacheableValues } = values;
  cache.set("timeRecordingFormValues", JSON.stringify(cacheableValues));
};

const getRecordingTime = (date: Date) => {
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join(".");
};

const clearInput = async (page: Page, element: ElementHandle, amount: number) => {
  await element.focus();
  for (let i = 0; i < amount; i++) {
    await page.keyboard.press("Delete");
  }
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
  let browser: Browser | undefined;
  let page: Page | undefined;
  try {
    const { domain, username, password } = getPreferenceValues<Preferences>();

    !!toast && (toast.message = "Opening page...");
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto(`https://${domain}/psap?p=TimeRecording&t=0`);
    await page.setViewport({ width: 1080, height: 800 });

    !!toast && (toast.message = "Logging in...");
    await page.type('[name="MT_BENUTZERNAME"]', username);
    await page.type('[name="MT_Kennwort"]', password);
    await page.click('input[type="submit"]');

    const iframe = await page.waitForSelector("#rootcontent > iframe");
    const content = await iframe?.contentFrame();
    if (!content) throw new Error("Frame not found");

    !!toast && (toast.message = "Setting date...");
    const dateInput = await content.waitForSelector('[name="datum"]', { timeout: 10000 });
    if (!dateInput) throw new Error("Could not find date input field");

    await clearInput(page, dateInput, 10);
    await dateInput.type(getRecordingTime(values.date), { delay: 10 });

    !!toast && (toast.message = "Setting duration...");
    await content.type('[name="dauer"]', values.duration, { delay: 10 });

    !!toast && (toast.message = "Setting client...");
    await selectOptionByLabel(page, content, "Client", values.client);

    !!toast && (toast.message = "Setting project...");
    await selectOptionByLabel(page, content, "Project", values.project);

    !!toast && (toast.message = "Setting activity...");
    await selectOptionByLabel(page, content, "Activity", values.activity);

    !!toast && (toast.message = "Setting location...");
    await selectOptionByLabel(page, content, "Location", values.location);

    !!toast && (toast.message = "Setting comment...");
    await content.type('[name="bemerkung1000"]', values.comment, { delay: 10 });

    !!toast && (toast.message = "Saving...");
    await content.click('[name="speichern"]', { delay: 10 });
  } catch (error) {
    if (toast) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to record time";
      toast.message = "Taking screenshot...";
    }
    environment.isDevelopment && console.error(error);
    const screenshotPath = `${environment.supportPath}/time-recording-error.png`;
    const screenshot = await page?.screenshot({ path: screenshotPath });
    if (screenshot) open(screenshotPath);

    throw new Error("Failed to record time");
  } finally {
    !!toast && (toast.message = "Finishing...");
    await browser?.close();
  }
};

export default function TimeRecordingCommand() {
  const { itemProps, handleSubmit } = useForm<FormValues>({
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
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker title="Date" {...itemProps.date} />
      <Form.TextField title="Duration" {...itemProps.duration} storeValue />
      <Form.TextField title="Client" {...itemProps.client} storeValue />
      <Form.TextField title="Project" {...itemProps.project} storeValue />
      <Form.TextField title="Activity" {...itemProps.activity} storeValue />
      <Form.Dropdown title="Location" {...itemProps.location} storeValue>
        {locationOptions.map((option) => (
          <Form.Dropdown.Item key={option} value={option} title={option} />
        ))}
      </Form.Dropdown>
      <Form.TextArea title="Comment" {...itemProps.comment} />
    </Form>
  );
}
