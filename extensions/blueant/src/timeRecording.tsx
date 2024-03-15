import { Form, ActionPanel, Action, showToast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";

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

export default function TimeRecordingCommand() {
  const { itemProps } = useForm<FormValues>({
    onSubmit,
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
          <Action.SubmitForm onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker title="Date" {...itemProps.date} />
      <Form.TextField title="Duration" {...itemProps.duration} />
      <Form.TextField title="Client" {...itemProps.client} />
      <Form.TextField title="Project" {...itemProps.project} />
      <Form.TextField title="Activity" {...itemProps.activity} />
      <Form.Dropdown title="Location" {...itemProps.location}>
        <Form.Dropdown.Item value="v280167775" title="on site" />
        <Form.Dropdown.Item value="v367750664" title="Office Cologne" />
        <Form.Dropdown.Item value="v367750930" title="Office Stuttgart" />
        <Form.Dropdown.Item value="v367750666" title="Office Munich" />
        <Form.Dropdown.Item value="v367750932" title="Office Berlin" />
        <Form.Dropdown.Item value="v367750935" title="Office Lisbon" />
        <Form.Dropdown.Item value="v488880998" title="Office Leiria" />
        <Form.Dropdown.Item value="v671179242" title="Office Zurich" />
        <Form.Dropdown.Item value="v367750938" title="Home Office" />
        <Form.Dropdown.Item value="v1707923031" title="Office Viseu" />
        <Form.Dropdown.Item value="v1831935122" title="Office Frankfurt" />
      </Form.Dropdown>
      <Form.TextArea title="Comment" {...itemProps.comment} />
      <Form.Checkbox label="Billable" {...itemProps.isBillable} />
    </Form>
  );
}
