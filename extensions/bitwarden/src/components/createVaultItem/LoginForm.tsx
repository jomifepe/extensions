import { Form } from "@raycast/api";
import { useState } from "react";
import { useFormContext } from "~/context/form";
import { URI_MATCH_TYPE_TO_LABEL_MAP } from "~/constants/labels";
import { CreateItemPayload, Login, Uris } from "~/types/vault";
import useOnUnmount from "~/utils/hooks/useOnUnmount";

const LOGIN_DEFAULT_VALUES: Login = {
  username: null,
  password: null,
  totp: null,
  passwordRevisionDate: null,
};

export const DEFAULT_MATCH_VALUE = "default";

const passwordInfo = `⌘+P to generate a password and fill it in`;

function LoginForm() {
  const { state, setField, defaultValues } = useFormContext<CreateItemPayload>();
  const [uri, setUri] = useState<Uris>({ uri: null, match: null });

  useOnUnmount(() => setField("login", defaultValues["login"]), []);

  const handleFieldChange =
    <TField extends keyof Login>(field: TField) =>
    (value: Login[TField]) => {
      setField("login", (login) => ({ ...LOGIN_DEFAULT_VALUES, ...login, [field]: value }));
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
      <Form.TextField
        id="username"
        title="Username"
        value={state.login?.username ?? ""}
        onChange={handleFieldChange("username")}
      />
      <Form.PasswordField
        id="password"
        title="Password"
        value={state.login?.password ?? ""}
        onChange={handleFieldChange("password")}
        info={passwordInfo}
      />
      <Form.TextField
        id="totp"
        title="Authenticator key (TOTP)"
        value={state.login?.totp ?? ""}
        onChange={handleFieldChange("totp")}
      />
      <Form.TextField
        id="url"
        title="URL 1"
        placeholder="URL 1"
        value={state.login?.uris?.[0].uri ?? ""}
        onChange={handleUriChange("uri")}
      />
      <Form.Dropdown
        id="match"
        title="Match detection"
        placeholder="Select a match"
        value={`${state.login?.uris?.[0].match || DEFAULT_MATCH_VALUE}`}
        onChange={handleUriChange("match")}
      >
        <Form.Dropdown.Item value={DEFAULT_MATCH_VALUE} title="Default match detection" />
        {Object.entries(URI_MATCH_TYPE_TO_LABEL_MAP).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={value} />
        ))}
      </Form.Dropdown>
    </>
  );
}

export default LoginForm;
