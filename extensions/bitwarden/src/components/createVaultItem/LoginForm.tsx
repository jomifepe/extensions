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

function LoginForm() {
  const { setField, defaultValues } = useFormContext<CreateItemPayload>();
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

export default LoginForm;
