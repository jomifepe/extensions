import { Form } from "@raycast/api";
import { useFormContext } from "~/context/form";
import { CreateItemPayload, Identity } from "~/types/vault";
import useOnUnmount from "~/utils/hooks/useOnUnmount";

const IDENTITY_DEFAULT_VALUES: Identity = {
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

function IdentityForm() {
  const { setField, defaultValues } = useFormContext<CreateItemPayload>();

  useOnUnmount(() => setField("identity", defaultValues["identity"]), []);

  const handleFieldChange =
    <TField extends keyof Identity>(field: TField) =>
    (value: Identity[TField]) => {
      setField("identity", (identity) => ({ ...IDENTITY_DEFAULT_VALUES, ...identity, [field]: value }));
    };

  return (
    <>
      <Form.TextField id="firstName" title="First name" onChange={handleFieldChange("firstName")} />
      <Form.TextField id="middleName" title="Middle name" onChange={handleFieldChange("middleName")} />
      <Form.TextField id="lastName" title="Last name" onChange={handleFieldChange("lastName")} />
      <Form.TextField id="username" title="Username" onChange={handleFieldChange("username")} />
      <Form.TextField id="company" title="Company" onChange={handleFieldChange("company")} />
      <Form.TextField id="ssn" title="Social Security number" onChange={handleFieldChange("ssn")} />
      <Form.TextField id="passportNumber" title="Passport number" onChange={handleFieldChange("passportNumber")} />
      <Form.TextField id="licenseNumber" title="License number" onChange={handleFieldChange("licenseNumber")} />
      <Form.TextField id="email" title="Email" onChange={handleFieldChange("email")} />
      <Form.TextField id="phone" title="Phone" onChange={handleFieldChange("phone")} />
      <Form.TextField id="address1" title="Address 1" onChange={handleFieldChange("address1")} />
      <Form.TextField id="address2" title="Address 2" onChange={handleFieldChange("address2")} />
      <Form.TextField id="address3" title="Address 3" onChange={handleFieldChange("address3")} />
      <Form.TextField id="city" title="City / Town" onChange={handleFieldChange("city")} />
      <Form.TextField id="state" title="State / Province" onChange={handleFieldChange("state")} />
      <Form.TextField id="postalCode" title="Zip / Postal code" onChange={handleFieldChange("postalCode")} />
      <Form.TextField id="country" title="Country" onChange={handleFieldChange("country")} />
    </>
  );
}

export default IdentityForm;
