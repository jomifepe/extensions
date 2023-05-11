import { Action, ActionPanel, Form, Icon, Toast, closeMainWindow, showHUD, showToast } from "@raycast/api";
import { useState } from "react";
import RootErrorBoundary from "~/components/RootErrorBoundary";
import { FormProvider, useForm } from "~/context/form";
import { BitwardenProvider, useBitwarden } from "~/context/bitwarden";
import { SessionProvider } from "~/context/session";
import { useVault, VaultProvider } from "~/context/vault";
import { CreateItemPayload, ItemType, Login, Reprompt } from "~/types/vault";
import { Folder } from "~/types/vault";
import { captureException } from "~/utils/development";
import LoginForm from "~/components/createVaultItem/LoginForm";
import CardForm from "~/components/createVaultItem/CardForm";
import IdentityForm from "~/components/createVaultItem/IdentityForm";
import usePasswordGenerator from "~/utils/hooks/usePasswordGenerator";

const defaultValues = {
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

const CreateItemCommand = () => (
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
  const [type, setType] = useState(ItemType.LOGIN);
  const formState = useForm<CreateItemPayload>({ defaultValues });
  const { isGenerating: isGeneratingPassword, regeneratePassword } = usePasswordGenerator({ generateOnMount: false });

  const { state, setField, handleSubmit } = formState;

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

  const submitForm = async (item: CreateItemPayload) => {
    try {
      await bitwarden.createItem(item);
      await showHUD("Item created");
      await closeMainWindow();
    } catch (error) {
      await showToast(Toast.Style.Failure, "Failed to create item");
      captureException("Failed to create item", error);
    }
  };

  const generateAndFillPassword = async () => {
    const password = await regeneratePassword();
    if (password) {
      setField("login", (login) => ({
        username: null,
        totp: null,
        passwordRevisionDate: null,
        ...login,
        password,
      }));
    }
  };

  return (
    <FormProvider formState={formState}>
      <Form
        isLoading={isLoading || isGeneratingPassword}
        actions={
          <ActionPanel>
            <Action.SubmitForm title="Save Item" icon={Icon.SaveDocument} onSubmit={handleSubmit(submitForm)} />
            <Action
              title="Generate Password"
              icon={Icon.Key}
              onAction={generateAndFillPassword}
              shortcut={{ modifiers: ["cmd"], key: "p" }}
            />
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
        <Form.TextField id="name" title="Name" onChange={handleFieldChange("name")} value={state.name} />
        <Form.Dropdown
          id="folder"
          title="Folder"
          placeholder="Select a folder"
          value={state.folderId ?? folders.length > 0 ? NO_FOLDER_ID : undefined}
          onChange={handlerFolderChange}
        >
          {folders.map((folder: Folder) => (
            <Form.Dropdown.Item key={folder.id} value={folder.id ?? NO_FOLDER_ID} title={folder.name} />
          ))}
        </Form.Dropdown>
        {type === ItemType.LOGIN && <LoginForm />}
        {type === ItemType.CARD && <CardForm />}
        {type === ItemType.IDENTITY && <IdentityForm />}
        <Form.TextArea
          id="notes"
          title="Notes"
          onChange={handleFieldChange("notes")}
          value={state.notes ?? defaultValues.notes}
        />
        <Form.Checkbox
          id="reprompt"
          label="Master password re-prompt"
          onChange={handleRepromptChange}
          value={state.reprompt === Reprompt.REQUIRED}
        />
      </Form>
    </FormProvider>
  );
}

export default CreateItemCommand;
