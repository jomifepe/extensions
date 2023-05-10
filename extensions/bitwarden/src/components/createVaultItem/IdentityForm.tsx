import { Form } from "@raycast/api";
import { IDENTITY_TITLE_TO_LABEL_MAP } from "~/constants/labels";
import { useFormContext } from "~/context/form";
import { CreateItemPayload, Identity, IdentityTitle } from "~/types/vault";
import useOnUnmount from "~/utils/hooks/useOnUnmount";

const IDENTITY_DEFAULT_VALUES: Identity = {
  title: null,
  firstName: null,
  middleName: null,
  lastName: null,
  address1: null,
  address2: null,
  address3: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
  company: null,
  email: null,
  phone: null,
  ssn: null,
  username: null,
  passportNumber: null,
  licenseNumber: null,
};

const NO_TITLE_VALUE = "no-identity-title";

function IdentityForm() {
  const { state, setField, defaultValues } = useFormContext<CreateItemPayload>();

  useOnUnmount(() => setField("identity", defaultValues["identity"]), []);

  const handleFieldChange =
    <TField extends keyof Identity>(field: TField) =>
    (value: Identity[TField]) => {
      setField("identity", (identity) => ({ ...IDENTITY_DEFAULT_VALUES, ...identity, [field]: value }));
    };

  const handleTitleChange = (value: string) => {
    handleFieldChange("title")(value === NO_TITLE_VALUE ? null : IdentityTitle[value as keyof typeof IdentityTitle]);
  };

  return (
    <>
      <Form.Dropdown id="title" title="Title" value={state.card?.brand ?? NO_TITLE_VALUE} onChange={handleTitleChange}>
        <Form.Dropdown.Item value={NO_TITLE_VALUE} title="-- Select --" />
        {Object.entries(IDENTITY_TITLE_TO_LABEL_MAP).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={value} />
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="firstName"
        title="First name"
        value={state.identity?.firstName ?? ""}
        onChange={handleFieldChange("firstName")}
      />
      <Form.TextField
        id="middleName"
        title="Middle name"
        value={state.identity?.middleName ?? ""}
        onChange={handleFieldChange("middleName")}
      />
      <Form.TextField
        id="lastName"
        title="Last name"
        value={state.identity?.lastName ?? ""}
        onChange={handleFieldChange("lastName")}
      />
      <Form.TextField
        id="username"
        title="Username"
        value={state.identity?.username ?? ""}
        onChange={handleFieldChange("username")}
      />
      <Form.TextField
        id="company"
        title="Company"
        value={state.identity?.company ?? ""}
        onChange={handleFieldChange("company")}
      />
      <Form.TextField
        id="ssn"
        title="Social Security number"
        value={state.identity?.ssn ?? ""}
        onChange={handleFieldChange("ssn")}
      />
      <Form.TextField
        id="passportNumber"
        title="Passport number"
        value={state.identity?.passportNumber ?? ""}
        onChange={handleFieldChange("passportNumber")}
      />
      <Form.TextField
        id="licenseNumber"
        title="License number"
        value={state.identity?.licenseNumber ?? ""}
        onChange={handleFieldChange("licenseNumber")}
      />
      <Form.TextField
        id="email"
        title="Email"
        value={state.identity?.email ?? ""}
        onChange={handleFieldChange("email")}
      />
      <Form.TextField
        id="phone"
        title="Phone"
        value={state.identity?.phone ?? ""}
        onChange={handleFieldChange("phone")}
      />
      <Form.TextField
        id="address1"
        title="Address 1"
        value={state.identity?.address1 ?? ""}
        onChange={handleFieldChange("address1")}
      />
      <Form.TextField
        id="address2"
        title="Address 2"
        value={state.identity?.address2 ?? ""}
        onChange={handleFieldChange("address2")}
      />
      <Form.TextField
        id="address3"
        title="Address 3"
        value={state.identity?.address3 ?? ""}
        onChange={handleFieldChange("address3")}
      />
      <Form.TextField
        id="city"
        title="City / Town"
        value={state.identity?.city ?? ""}
        onChange={handleFieldChange("city")}
      />
      <Form.TextField
        id="state"
        title="State / Province"
        value={state.identity?.state ?? ""}
        onChange={handleFieldChange("state")}
      />
      <Form.TextField
        id="postalCode"
        title="Zip / Postal code"
        value={state.identity?.postalCode ?? ""}
        onChange={handleFieldChange("postalCode")}
      />
      <Form.TextField
        id="country"
        title="Country"
        value={state.identity?.country ?? ""}
        onChange={handleFieldChange("country")}
      />
    </>
  );
}

export default IdentityForm;
