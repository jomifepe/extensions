import { Form, ActionPanel, Action, showToast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";

const locationOptions = [
  { value: "v280167775", title: "on site" },
  { value: "v367750664", title: "Office Cologne" },
  { value: "v367750930", title: "Office Stuttgart" },
  { value: "v367750666", title: "Office Munich" },
  { value: "v367750932", title: "Office Berlin" },
  { value: "v367750935", title: "Office Lisbon" },
  { value: "v488880998", title: "Office Leiria" },
  { value: "v671179242", title: "Office Zurich" },
  { value: "v367750938", title: "Home Office" },
  { value: "v1707923031", title: "Office Viseu" },
  { value: "v1831935122", title: "Office Frankfurt" },
] as const;

type FormValues = {
  date: Date | null;
  duration: string;
  client: string;
  project: string;
  activity: string;
  location: string;
  comment: string;
  isBillable: boolean;
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
  isBillable: false,
};

export default function TimeRecordingCommand() {
  const { itemProps, handleSubmit } = useForm<FormValues>({
    onSubmit,
    initialValues,
    validation: {
      date: FormValidation.Required,
      duration: FormValidation.Required,
      client: FormValidation.Required,
      project: FormValidation.Required,
      activity: FormValidation.Required,
      location: FormValidation.Required,
      comment: FormValidation.Required,
      isBillable: FormValidation.Required,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    showToast({ title: "Submitted form", message: "See logs for submitted values" });
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
          <Form.Dropdown.Item key={option.value} {...option} />
        ))}
      </Form.Dropdown>
      <Form.TextArea title="Comment" {...itemProps.comment} />
      <Form.Checkbox label="Billable" {...itemProps.isBillable} />
    </Form>
  );
}
