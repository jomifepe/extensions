import { Form } from "@raycast/api";
import { useState } from "react";
import RootErrorBoundary from "~/components/RootErrorBoundary";
import { MONTH_NUMBER_TO_LABEL_MAP, URI_MATCH_TYPE_TO_LABEL_MAP } from "~/constants/labels";
import { BitwardenProvider } from "~/context/bitwarden";
import { SessionProvider } from "~/context/session";
import { useVault, VaultProvider } from "~/context/vault";
import { Card, Identity, ItemType, Login, Uris } from "~/types/vault";
import { Folder, Item } from "~/types/vault";

const SearchVaultCommand = () => (
  <RootErrorBoundary>
    <BitwardenProvider>
      <SessionProvider unlock>
        <VaultProvider>
          <CreateNewItemComponent />
        </VaultProvider>
      </SessionProvider>
    </BitwardenProvider>
  </RootErrorBoundary>
);

function CreateNewItemComponent() {
  const { folders } = useVault();
  const [type, setType] = useState<ItemType>(ItemType.LOGIN);

  const handleFieldChange =
    <TField extends keyof Item>(field: TField) =>
    (value: Item[TField]) => {
      console.log(field, value);
    };

  const handleTypeChange = (type: string) => {
    setType(ItemType[type.toUpperCase() as keyof typeof ItemType]);
  };

  const handleRepromptChange = (value: boolean) => handleFieldChange("reprompt")(+value);

  return (
    <Form>
      <Form.Dropdown id="type" title="Type" placeholder="Select a type" onChange={handleTypeChange}>
        <Form.Dropdown.Item value="login" title="Login" />
        <Form.Dropdown.Item value="card" title="Card" />
        <Form.Dropdown.Item value="identity" title="Identity" />
        <Form.Dropdown.Item value="secureNote" title="Secure Note" />
      </Form.Dropdown>
      <Form.TextField id="name" title="Name" onChange={handleFieldChange("name")} />
      <Form.Dropdown id="folder" title="Folder" placeholder="Select a folder" onChange={handleFieldChange("folderId")}>
        {folders.map((folder: Folder) => (
          <Form.Dropdown.Item key={folder.id} value={folder.id} title={folder.name} />
        ))}
      </Form.Dropdown>
      {type === ItemType.LOGIN && <LoginForm onChange={handleFieldChange} />}
      {type === ItemType.CARD && <CardForm onChange={handleFieldChange} />}
      {type === ItemType.IDENTITY && <IdentityForm onChange={handleFieldChange} />}
      <Form.TextArea id="notes" title="Notes" onChange={handleFieldChange("notes")} />
      <Form.Checkbox id="reprompt" label="Master password re-prompt" onChange={handleRepromptChange} />
    </Form>
  );
}

function LoginForm({ onChange }: { onChange: (value: any) => void }) {
  const [uri, setUri] = useState<Uris>({ uri: null, match: null });

  const handleFieldChange =
    <TField extends keyof Login>(field: TField) =>
    (value: Login[TField]) => {
      onChange(field === "uris" ? [value] : value);
    };

  const handleUriChange =
    <TField extends keyof Uris>(field: TField) =>
    (value: string) => {
      const newUri = { ...uri, [field]: field === "match" ? parseInt(value) : value };
      setUri(newUri);
      handleFieldChange("uris")([newUri]);
    };

  return (
    <>
      <Form.TextField id="username" title="Username" onChange={handleFieldChange("username")} />
      <Form.TextField id="password" title="Password" onChange={handleFieldChange("password")} />
      <Form.TextField id="totp" title="Authenticator key (TOTP)" onChange={handleFieldChange("totp")} />
      <Form.TextField id="url" title="URL 1" placeholder="URL 1" onChange={handleUriChange("uri")} />
      <Form.Dropdown
        id="match"
        title="Match detection"
        placeholder="Select a match"
        onChange={handleUriChange("match")}
      >
        {Object.entries(URI_MATCH_TYPE_TO_LABEL_MAP).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={value} />
        ))}
      </Form.Dropdown>
    </>
  );
}

function CardForm({ onChange }: { onChange: (field: any, value: any) => void }) {
  const handleFieldChange =
    <O extends keyof Card>(field: O) =>
    (value: string) => {
      onChange(field, value);
    };

  return (
    <>
      <Form.TextField id="cardholderName" title="Cardholder name" onChange={handleFieldChange("cardholderName")} />
      <Form.TextField id="brand" title="Brand" onChange={handleFieldChange("brand")} />
      <Form.TextField id="number" title="Number" onChange={handleFieldChange("number")} />
      <Form.Dropdown id="expMonth" title="Expiration month" onChange={handleFieldChange("expMonth")}>
        {Object.entries(MONTH_NUMBER_TO_LABEL_MAP).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={value} />
        ))}
      </Form.Dropdown>
      <Form.TextField id="expYear" title="Expiration year" onChange={handleFieldChange("expYear")} />
      <Form.TextField id="code" title="Security code (CVV)" onChange={handleFieldChange("code")} />
    </>
  );
}

function IdentityForm({ onChange }: { onChange: (field: any, value: any) => void }) {
  const handleFieldChange =
    <O extends keyof Identity>(field: O) =>
    (value: string) => {
      onChange(field, value);
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

export default SearchVaultCommand;
