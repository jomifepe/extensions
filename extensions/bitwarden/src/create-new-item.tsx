import { Action, ActionPanel, Form, Toast, closeMainWindow, showHUD, showToast } from "@raycast/api";
import { ReactNode, createContext, useContext, useState } from "react";
import RootErrorBoundary from "~/components/RootErrorBoundary";
import { MONTH_NUMBER_TO_LABEL_MAP, URI_MATCH_TYPE_TO_LABEL_MAP } from "~/constants/labels";
import { BitwardenProvider, useBitwarden } from "~/context/bitwarden";
import { SessionProvider } from "~/context/session";
import { useVault, VaultProvider } from "~/context/vault";
import { Card, CreateItemPayload, Identity, ItemType, Login, Reprompt, Uris } from "~/types/vault";
import { Folder } from "~/types/vault";
import { captureException } from "~/utils/development";

const initialItemState: CreateItemPayload = {
  organizationId: null,
  folderId: null,
  type: ItemType.LOGIN,
  reprompt: Reprompt.NO,
  name: "",
  notes: "",
  favorite: false,
  collectionIds: [],
  fields: [],
  login: null,
  identity: null,
  secureNote: null,
  card: null,
};

type FormContextType = {
  item: CreateItemPayload;
  setField: <TField extends keyof CreateItemPayload>(
    field: TField,
    value: CreateItemPayload[TField] | ((value: CreateItemPayload[TField]) => CreateItemPayload[TField])
  ) => void;
  type: ItemType;
  setType: (type: ItemType) => void;
};

const FormContext = createContext<FormContextType>({} as FormContextType);

const FormProvider = ({ children }: { children: ReactNode }) => {
  const [item, setItem] = useState<CreateItemPayload>(initialItemState);
  const [type, setType] = useState<ItemType>(ItemType.LOGIN);

  const setField: FormContextType["setField"] = (field, value) => {
    setItem({ ...item, [field]: typeof value === "function" ? value(item[field]) : value });
  };

  return <FormContext.Provider value={{ item, type, setField, setType }}>{children}</FormContext.Provider>;
};

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error("useFormContext must be used within a FormProvider");

  return context;
};

const CreateItemCommand = () => (
  <RootErrorBoundary>
    <BitwardenProvider>
      <SessionProvider unlock>
        <VaultProvider>
          <FormProvider>
            <CreateNewItemComponent />
          </FormProvider>
        </VaultProvider>
      </SessionProvider>
    </BitwardenProvider>
  </RootErrorBoundary>
);

const TYPE_TO_VALUE_MAP: Record<ItemType, string> = {
  [ItemType.LOGIN]: "login",
  [ItemType.NOTE]: "secureNote",
  [ItemType.CARD]: "card",
  [ItemType.IDENTITY]: "identity",
};

const NO_FOLDER_ID = "no-folder";

function CreateNewItemComponent() {
  const bitwarden = useBitwarden();
  const { isLoading, folders } = useVault();
  const { type, item, setField, setType } = useFormContext();

  const handleFieldChange =
    <TField extends keyof CreateItemPayload>(field: TField) =>
    (value: CreateItemPayload[TField]) => {
      setField(field, value);
    };

  const handleTypeChange = (type: string) => {
    setType(ItemType[type.toUpperCase() as keyof typeof ItemType]);
  };

  const handleRepromptChange = (value: boolean) => handleFieldChange("reprompt")(+value);

  const handlerFolderChange = (value: string) => {
    handleFieldChange("folderId")(value === NO_FOLDER_ID ? null : value);
  };

  const handleSubmit = async () => {
    try {
      await bitwarden.createItem(item);
      await showHUD("Item created");
      await closeMainWindow();
    } catch (error) {
      await showToast(Toast.Style.Failure, "Failed to create item");
      captureException("Failed to create item", error);
    }
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Item" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="type"
        title="Type"
        placeholder="Select a type"
        value={TYPE_TO_VALUE_MAP[type]}
        onChange={handleTypeChange}
      >
        <Form.Dropdown.Item value="login" title="Login" />
        <Form.Dropdown.Item value="card" title="Card" />
        <Form.Dropdown.Item value="identity" title="Identity" />
        <Form.Dropdown.Item value="secureNote" title="Secure Note" />
      </Form.Dropdown>
      <Form.TextField id="name" title="Name" onChange={handleFieldChange("name")} />
      <Form.Dropdown
        id="folder"
        title="Folder"
        placeholder="Select a folder"
        defaultValue={folders.length > 0 ? NO_FOLDER_ID : undefined}
        onChange={handlerFolderChange}
      >
        {folders.map((folder: Folder) => (
          <Form.Dropdown.Item key={folder.id} value={folder.id ?? NO_FOLDER_ID} title={folder.name} />
        ))}
      </Form.Dropdown>
      {type === ItemType.LOGIN && <LoginForm />}
      {type === ItemType.CARD && <CardForm />}
      {type === ItemType.IDENTITY && <IdentityForm />}
      <Form.TextArea id="notes" title="Notes" onChange={handleFieldChange("notes")} />
      <Form.Checkbox id="reprompt" label="Master password re-prompt" onChange={handleRepromptChange} />
    </Form>
  );
}

function LoginForm() {
  const { setField } = useFormContext();
  const [uri, setUri] = useState<Uris>({ uri: null, match: null });

  const handleFieldChange =
    <TField extends keyof Login>(field: TField) =>
    (value: Login[TField]) => {
      setField("login", (login) => ({ ...((login ?? {}) as Login), [field]: value }));
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

function CardForm() {
  const { setField } = useFormContext();

  const handleFieldChange =
    <TField extends keyof Card>(field: TField) =>
    (value: Card[TField]) => {
      setField("card", (card) => ({ ...((card ?? {}) as Card), [field]: value }));
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

function IdentityForm() {
  const { setField } = useFormContext();

  const handleFieldChange =
    <TField extends keyof Identity>(field: TField) =>
    (value: Identity[TField]) => {
      setField("identity", (identity) => ({ ...((identity ?? {}) as Identity), [field]: value }));
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

export default CreateItemCommand;
